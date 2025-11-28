import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emailOrUsername, password } = await req.json();

    console.log('Login attempt for:', emailOrUsername);

    // Create service role client to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check profiles table - filter out null passwords and use limit(1)
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, username, password')
      .or(`email.eq.${emailOrUsername},username.eq.${emailOrUsername}`)
      .not('password', 'is', null)
      .limit(1);

    const profile = profiles?.[0];
    console.log('Profile query result:', { found: !!profile, error: profileError });

    if (!profile) {
      console.log('User not found in profiles table');
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid credentials' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    // Verify password
    if (profile.password !== password) {
      console.log('Password mismatch');
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid credentials' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      );
    }

    console.log('Credentials verified successfully');

    // Determine user role by checking various tables
    let userRole = 'user';
    
    // Check if super admin
    if (profile.email === 'admin@roririsoft.com' || profile.username === 'admin') {
      userRole = 'super_admin';
    } else {
      // Check user_roles table for admin
      const { data: adminRole } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', profile.id)
        .eq('role', 'admin')
        .single();
      
      if (adminRole) {
        userRole = 'admin';
      } else {
        // Check if employee
        const { data: employee } = await supabaseAdmin
          .from('employees')
          .select('id')
          .eq('profile_id', profile.id)
          .single();
        
        if (employee) {
          userRole = 'employee';
        } else {
          // Check if trainee (students table)
          const { data: trainee } = await supabaseAdmin
            .from('students')
            .select('id')
            .eq('profile_id', profile.id)
            .single();
          
          if (trainee) {
            userRole = 'trainee';
          } else {
            // Check if intern
            const { data: intern } = await supabaseAdmin
              .from('internship_candidates')
              .select('id')
              .eq('profile_id', profile.id)
              .single();
            
            if (intern) {
              userRole = 'intern';
            }
          }
        }
      }
    }

    console.log('User role determined:', userRole);

    // Return the email, password, and role
    return new Response(
      JSON.stringify({ 
        success: true, 
        email: profile.email,
        password: profile.password,
        role: userRole
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in verify-login:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
