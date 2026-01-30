// @ts-ignore: ESM imports work in Deno runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Returns the logged-in user's primary role (from public.user_roles),
// derived from the caller's email in the JWT.
//
// This avoids relying on direct SELECT access to user_roles from the client,
// while still keeping roles stored in the dedicated table.

// @ts-ignore: Deno global is available in Supabase Edge Functions
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // @ts-ignore: Deno global is available in Supabase Edge Functions
    const supabaseAdmin = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // Validate caller and extract email
    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
    if (userErr || !userData?.user?.email) {
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const email = userData.user.email

    const { data: userLogin, error: loginErr } = await supabaseAdmin
      .from('user_login')
      .select('original_id')
      .eq('email', email)
      .maybeSingle()

    if (loginErr || !userLogin?.original_id) {
      return new Response(JSON.stringify({ success: true, primaryRole: null, roles: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const originalId = userLogin.original_id

    // If employee, use their entity_id to pick the primary role for that entity.
    const { data: employee, error: empErr } = await supabaseAdmin
      .from('employees')
      .select('entity_id')
      .eq('profile_id', originalId)
      .maybeSingle()

    const employeeEntityId = !empErr ? employee?.entity_id ?? null : null

    const { data: roles, error: rolesErr } = await supabaseAdmin
      .from('user_roles')
      .select('id, role, entity_id')
      .eq('user_id', originalId)

    if (rolesErr) {
      return new Response(JSON.stringify({ success: true, primaryRole: null, roles: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    let primaryRole: string | null = null
    if (roles && roles.length > 0) {
      const entityRole = employeeEntityId ? roles.find((r) => r.entity_id === employeeEntityId) : null
      primaryRole = (entityRole?.role ?? roles[0]?.role ?? null) as string | null
    }

    return new Response(
      JSON.stringify({ success: true, primaryRole, roles: roles ?? [], originalId }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (e) {
    console.error('get-my-primary-role error:', e)
    return new Response(JSON.stringify({ success: false, message: 'Server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
