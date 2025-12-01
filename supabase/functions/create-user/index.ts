// @ts-ignore: ESM imports work in Deno runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

// @ts-ignore: Deno global is available in Supabase Edge Functions
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fullName, email, phone, dob, role, entityId, username, password } = await req.json()

    // Validate input
    if (!fullName || !email || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: fullName, email, and role are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email address' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Supabase service role client
    // @ts-ignore: Deno global is available in Supabase Edge Functions
    const supabaseAdmin = createClient(
      // @ts-ignore: Deno global is available in Supabase Edge Functions
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore: Deno global is available in Supabase Edge Functions
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Generate a temporary password or use provided one
    const tempPassword = password || `Temp${Math.random().toString(36).slice(-8)}!`

    // Create user in auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone: phone || null
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: authError.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const userId = authData.user.id

    // Create or update profile with all user data including username and password
    const profileData: any = {
      id: userId,
      email: email,
      full_name: fullName,
    };

    if (phone) profileData.phone = phone;
    if (dob) profileData.dob = dob;
    if (username) profileData.username = username;
    if (password) profileData.password = password;

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' })

    if (profileError) {
      console.error('Profile upsert error:', profileError)
      // Try to clean up the user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return new Response(
        JSON.stringify({ error: 'Failed to create user profile' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Insert into user_login table
    const loginData = {
      email: email,
      username: username || null,
      password: password || tempPassword,
      user_type: 'profile',
      original_id: userId
    };

    const { error: loginError } = await supabaseAdmin
      .from('user_login')
      .insert(loginData)

    if (loginError) {
      console.error('User login insert error:', loginError)
      // Try to clean up the user if login creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return new Response(
        JSON.stringify({ error: 'Failed to create user login record' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Assign role - accept any role from the roles table
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({ 
        user_id: userId, 
        role: role,
        entity_id: entityId || null
      })

    if (roleError) {
      console.error('Role assignment error:', roleError)
      // Try to clean up the user if role assignment fails
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return new Response(
        JSON.stringify({ error: 'Failed to assign role' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send password reset email
    const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
    })

    if (resetError) {
      console.error('Password reset email error:', resetError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId,
        message: 'User created successfully. They will receive an email to set their password.' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
