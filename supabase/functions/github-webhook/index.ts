import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-hub-signature-256",
};

/**
 * Verify GitHub webhook HMAC SHA256 signature
 */
async function verifySignature(secret: string, header: string, payload: string): Promise<boolean> {
  if (!header || !header.startsWith("sha256=")) return false;
  const signature = header.replace("sha256=", "");
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const signatureHex = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return signatureHex === signature;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const webhookSecret = Deno.env.get("GITHUB_WEBHOOK_SECRET") ?? "";

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const deliveryId = req.headers.get("x-github-delivery") ?? crypto.randomUUID();
    const eventType = req.headers.get("x-github-event") ?? "ping";
    const signature = req.headers.get("x-hub-signature-256") ?? "";
    const rawBody = await req.text();

    // Verify signature if secret configured
    if (webhookSecret && !(await verifySignature(webhookSecret, signature, rawBody))) {
      return new Response(JSON.stringify({ error: "Invalid HMAC signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = rawBody ? JSON.parse(rawBody) : {};

    // 1. Idempotency check: record webhook event
    const { error: eventError } = await supabase.from("webhook_events").insert({
      delivery_id: deliveryId,
      event_type: eventType,
      action: payload.action ?? null,
      payload: payload,
      status: "RECEIVED",
    });

    if (eventError && eventError.code === "23505") {
      // Duplicate delivery
      return new Response(JSON.stringify({ status: "ignored", reason: "duplicate_delivery" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle Pull Request events: opened, synchronize, reopened
    if (eventType === "pull_request" && ["opened", "synchronize", "reopened"].includes(payload.action)) {
      const pr = payload.pull_request;
      const repo = payload.repository;
      const installation = payload.installation;

      // Upsert repository if installation exists
      const { data: repoRecord } = await supabase
        .from("repositories")
        .select("id")
        .eq("github_repo_id", repo.id)
        .single();

      if (repoRecord) {
        // Upsert PR metadata
        const { data: prRecord, error: prError } = await supabase
          .from("pull_requests")
          .upsert(
            {
              repository_id: repoRecord.id,
              github_pr_id: pr.id,
              number: pr.number,
              title: pr.title,
              author_login: pr.user.login,
              author_avatar_url: pr.user.avatar_url,
              base_branch: pr.base.ref,
              head_branch: pr.head.ref,
              head_commit_sha: pr.head.sha,
              state: pr.state,
              additions: pr.additions ?? 0,
              deletions: pr.deletions ?? 0,
              changed_files_count: pr.changed_files ?? 0,
              github_created_at: pr.created_at,
              github_updated_at: pr.updated_at,
            },
            { onConflict: "repository_id, number" }
          )
          .select("id")
          .single();

        if (prRecord) {
          // Enqueue analysis job
          await supabase.from("analysis_jobs").upsert(
            {
              repository_id: repoRecord.id,
              pull_request_id: prRecord.id,
              commit_sha: pr.head.sha,
              analysis_version: "v1.0",
              status: "QUEUED",
              priority: 1,
            },
            { onConflict: "repository_id, pull_request_id, commit_sha, analysis_version" }
          );

          // Audit log
          await supabase.from("audit_logs").insert({
            repository_id: repoRecord.id,
            pull_request_id: prRecord.id,
            actor_name: "github_webhook",
            action: `pr_${payload.action}`,
            details: { pr_number: pr.number, commit_sha: pr.head.sha },
          });
        }
      }
    }

    return new Response(JSON.stringify({ status: "success", received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
