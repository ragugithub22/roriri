// @ts-ignore: ESM imports work in Deno runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// Returns the logged-in user's primary role (from public.user_roles).
// Supports both JWT-based auth and fallback via profile_id in request body
// for the custom login system.

// @ts-ignore: Deno global is available in Supabase Edge Functions
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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

    let originalId: string | null = null
    let email: string | null = null

    // Try JWT auth first
    const authHeader = req.headers.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token)
      
      if (!userErr && userData?.user?.email) {
        email = userData.user.email
        console.log('JWT auth successful for email:', email)
        
        // Look up original_id from user_login
        const { data: userLogin } = await supabaseAdmin
          .from('user_login')
          .select('original_id')
          .eq('email', email)
          .maybeSingle()
        
        if (userLogin?.original_id) {
          originalId = userLogin.original_id
        }
      }
    }

    // Fallback: accept profile_id from request body (for custom login system)
    if (!originalId) {
      try {
        const body = await req.json()
        if (body?.profile_id) {
          originalId = body.profile_id
          console.log('Using profile_id from request body:', originalId)
        }
      } catch {
        // No body or invalid JSON, continue
      }
    }

    // If we still don't have an originalId, return empty result
    if (!originalId) {
      console.log('No valid auth or profile_id provided')
      return new Response(JSON.stringify({ success: true, primaryRole: null, roles: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Get employee entity_id for role prioritization
    const { data: employee } = await supabaseAdmin
      .from('employees')
      .select('entity_id')
      .eq('profile_id', originalId)
      .maybeSingle()

    const employeeEntityId = employee?.entity_id ?? null

    // Get all roles for this user
    const { data: roles, error: rolesErr } = await supabaseAdmin
      .from('user_roles')
      .select('id, role, entity_id')
      .eq('user_id', originalId)

    if (rolesErr) {
      console.error('Error fetching roles:', rolesErr)
      return new Response(JSON.stringify({ success: true, primaryRole: null, roles: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Determine primary role (prefer entity-matched role)
    let primaryRole: string | null = null
    if (roles && roles.length > 0) {
      const entityRole = employeeEntityId ? roles.find((r) => r.entity_id === employeeEntityId) : null
      primaryRole = (entityRole?.role ?? roles[0]?.role ?? null) as string | null
    }

    console.log('Returning primaryRole:', primaryRole, 'for originalId:', originalId)

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
