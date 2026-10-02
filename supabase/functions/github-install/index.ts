import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const payload = await req.json();
    const { action, installation, repositories } = payload;

    if (!installation || !installation.id) {
      return new Response(JSON.stringify({ error: "Missing installation payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "created") {
      // Upsert installation metadata
      const { data: instData, error: instError } = await supabase
        .from("github_installations")
        .upsert(
          {
            installation_id: installation.id,
            account_login: installation.account.login,
            account_type: installation.account.type || "User",
            permissions: installation.permissions || {},
            is_active: true,
            installed_at: new Date().toISOString(),
          },
          { onConflict: "installation_id" }
        )
        .select("id")
        .single();

      if (instError) throw instError;

      // Upsert selected repositories if provided
      if (repositories && Array.isArray(repositories)) {
        for (const repo of repositories) {
          await supabase.from("repositories").upsert(
            {
              installation_id: instData.id,
              github_repo_id: repo.id,
              owner: installation.account.login,
              name: repo.name,
              full_name: repo.full_name,
              default_branch: "main",
              is_private: repo.private ?? false,
            },
            { onConflict: "github_repo_id" }
          );
        }
      }

      await supabase.from("audit_logs").insert({
        actor_name: "github_install",
        action: "installation_created",
        details: { installation_id: installation.id, account: installation.account.login },
      });
    } else if (action === "deleted") {
      // Mark inactive or remove
      await supabase
        .from("github_installations")
        .update({ is_active: false })
        .eq("installation_id", installation.id);

      await supabase.from("audit_logs").insert({
        actor_name: "github_install",
        action: "installation_deleted",
        details: { installation_id: installation.id },
      });
    }

    return new Response(JSON.stringify({ status: "success", action }), {
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
