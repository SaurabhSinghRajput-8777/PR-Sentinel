import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { record } = await req.json();
    
    // Webhook payload provides the newly inserted analysis_jobs row in `record`
    const jobId = record?.id;
    const prId = record?.pull_request_id;
    
    if (!jobId || !prId) {
      return new Response(JSON.stringify({ error: "Invalid webhook payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Mark job as RUNNING
    await supabase.from("analysis_jobs").update({
      status: "RUNNING",
      started_at: new Date().toISOString(),
      attempts: 1
    }).eq("id", jobId);

    // 2. Fetch PR details
    const { data: pr } = await supabase
      .from("pull_requests")
      .select("*, repositories(owner, name)")
      .eq("id", prId)
      .single();

    if (!pr) throw new Error("PR not found");

    // 3. Fetch PR files from GitHub
    let files = [];
    let rateLimitExceeded = false;
    let rateLimitMessage = "";
    
    try {
      const owner = pr.repositories?.owner || "TheAyushTandon";
      const repo = pr.repositories?.name || "Innovate-Test-Repo";
      
      const ghToken = Deno.env.get("GITHUB_TOKEN");
      const headers: Record<string, string> = {
        "User-Agent": "PR-Sentinel"
      };
      if (ghToken) {
        headers["Authorization"] = `Bearer ${ghToken}`;
      }
      
      const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pr.number}/files`, { headers });
      if (ghRes.ok) {
        files = await ghRes.json();
      } else {
        rateLimitExceeded = true;
        rateLimitMessage = await ghRes.text();
        console.error("Failed to fetch PR files from GitHub:", rateLimitMessage);
      }
    } catch (e: any) {
      console.error("Failed to fetch PR files from GitHub", e);
      rateLimitExceeded = true;
      rateLimitMessage = e.message;
    }

    // 4. Call Gemini API
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    let aiFindings = [];
    let estimatedComplexity = "MEDIUM";
    let riskScore = 50;
    let riskLevel = "MEDIUM";
    
    const startTime = Date.now();

    let geminiRawText = "";
    if (rateLimitExceeded) {
       // Mock fallback so the UI isn't empty, explaining the exact problem
       aiFindings = [{
         severity: "CRITICAL",
         category: "BUG",
         title: "GitHub API Rate Limit Exceeded",
         explanation: `The GitHub API rejected the request to fetch PR files. This usually happens when making unauthenticated requests. You must add a GITHUB_TOKEN to your Supabase Edge Function Secrets. Response: ${rateLimitMessage.substring(0, 100)}...`,
         file_path: "github_api",
         line_start: 1,
         line_end: 1,
         proposed_fix: "Run: supabase secrets set GITHUB_TOKEN=ghp_your_token_here",
         impact: "Analysis failed because no files could be read."
       }];
    } else if (geminiKey) {
      const systemInstruction = `You are PR Sentinel, an engineering risk intelligence analyzer. Analyze the provided PR diff context and output ONLY valid JSON matching: {"ai_findings": [{"severity": "CRITICAL"|"HIGH"|"MEDIUM"|"LOW", "category": "BUG"|"SECURITY"|"PERF"|"STYLE", "title": "...", "explanation": "...", "file_path": "...", "line_start": 1, "line_end": 1, "impact": "...", "proposed_fix": "..."}], "risk_score": <number 1-100>, "risk_level": "LOW"|"MEDIUM"|"HIGH"|"CRITICAL"}. The risk_score should be a precise integer from 1-100 based on the severity and number of vulnerabilities (e.g. a single CRITICAL bug should instantly push the score above 85, multiple HIGH bugs above 70).`;
      const strippedPr = { title: pr.title, body: pr.body };
      const strippedFiles = (files || []).map((f: any) => ({ filename: f.filename, patch: f.patch }));
      const prompt = `PR Metadata: ${JSON.stringify(strippedPr)}\nChanged Files: ${JSON.stringify(strippedFiles)}`;
      
      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${geminiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `${systemInstruction}\n\n${prompt}` }] }],
          generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
        })
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        geminiRawText = text || "";
        if (text) {
          try {
            const parsed = JSON.parse(text);
            aiFindings = parsed.ai_findings || [];
            
            // Allow AI to set the score, but fallback if it didn't
            if (typeof parsed.risk_score === "number") {
              riskScore = parsed.risk_score;
              riskLevel = parsed.risk_level || "MEDIUM";
            } else {
              estimatedComplexity = parsed.estimated_complexity || "MEDIUM";
            }
          } catch (e) {
            console.error("Failed to parse Gemini JSON output", e);
            geminiRawText = "Parse Error: " + e.message + "\nText was: " + text;
          }
        }
      } else {
        const errText = await geminiRes.text();
        console.error("Gemini API error", errText);
        geminiRawText = "Gemini API Error: " + errText;
        aiFindings = [{
         severity: "CRITICAL",
         category: "BUG",
         title: "Gemini API Error",
         explanation: `The Gemini API rejected the request. Response: ${errText.substring(0, 150)}...`,
         file_path: "gemini_api",
         line_start: 1,
         line_end: 1,
         proposed_fix: "Check GEMINI_API_KEY and model name in Edge Function.",
         impact: "Analysis failed because Gemini could not be reached."
       }];
      }
    } else {
       // Mock fallback
       aiFindings = [{
         severity: "CRITICAL",
         category: "BUG",
         title: "Mock Finding from Edge Function",
         explanation: "This is a fallback finding because GEMINI_API_KEY is not set in Supabase Secrets.",
         file_path: "mock.py",
         line_start: 1,
         line_end: 1,
         proposed_fix: "Set the GEMINI_API_KEY",
         impact: "Mock Impact"
       }];
    }

    const durationMs = Date.now() - startTime;
    // If riskScore wasn't set directly by the AI JSON, calculate a fallback
    if (riskScore === 50 && aiFindings.length > 0) {
       // Simple fallback calculation
       let calculatedScore = 0;
       aiFindings.forEach((f: any) => {
         if (f.severity === "CRITICAL") calculatedScore += 30;
         else if (f.severity === "HIGH") calculatedScore += 20;
         else if (f.severity === "MEDIUM") calculatedScore += 10;
         else if (f.severity === "LOW") calculatedScore += 5;
       });
       riskScore = Math.min(100, Math.max(0, calculatedScore));
       if (riskScore >= 85) riskLevel = "CRITICAL";
       else if (riskScore >= 70) riskLevel = "HIGH";
       else if (riskScore >= 40) riskLevel = "MEDIUM";
       else riskLevel = "LOW";
    } else if (riskScore === 50 && estimatedComplexity === "HIGH") {
       riskScore = 90;
       riskLevel = "CRITICAL";
    }

    let rawText = "";
    if (geminiKey && !rateLimitExceeded) {
        rawText = geminiRawText;
    } else {
        rawText = "Mock or Error: " + JSON.stringify(aiFindings);
    }
    
    // 5. Insert Analysis Run
    const { data: run } = await supabase.from("analysis_runs").insert({
      job_id: jobId,
      pull_request_id: prId,
      commit_sha: pr.head_commit_sha,
      risk_score: riskScore,
      risk_level: riskLevel,
      duration_ms: durationMs,
      raw_ai_output: rawText
    }).select("id").single();

    // 6. Insert Findings
    if (run && aiFindings.length > 0) {
      const formattedFindings = aiFindings.map((f: any) => ({
        analysis_run_id: run.id,
        pull_request_id: prId,
        severity: f.severity || "MEDIUM",
        category: f.category || "BUG",
        title: f.title || "Finding",
        explanation: f.explanation || "",
        file_path: f.file_path || "unknown",
        line_start: f.line_start || 1,
        line_end: f.line_end || 1,
        evidence: f.explanation || "No evidence provided",
        impact: f.impact || "",
        proposed_fix: f.proposed_fix || "",
        source: "ai",
        validation_status: "NONE"
      }));
      await supabase.from("findings").insert(formattedFindings);
    }

    // 7. Update PR
    await supabase.from("pull_requests").update({
      risk_score: riskScore,
      risk_level: riskLevel,
      review_brief: {
        summary: `AI review completed. Detected ${aiFindings.length} findings.`,
        key_risks: aiFindings.map((f: any) => f.title)
      }
    }).eq("id", prId);

    // 8. Mark Job COMPLETED
    await supabase.from("analysis_jobs").update({
      status: "COMPLETED",
      completed_at: new Date().toISOString()
    }).eq("id", jobId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Error in analyze-pr function", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
