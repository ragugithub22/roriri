// @ts-ignore: ESM imports work in Deno runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// @ts-ignore: Deno global is available in Supabase Edge Functions
Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emailOrUsername, password } = await req.json();

    console.log('Login attempt for:', emailOrUsername);

    // Create service role client to bypass RLS
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
    );

    // Check user_login table - filter out null passwords and use limit(1)
    const { data: userLogins, error: loginError } = await supabaseAdmin
      .from('user_login')
      .select('id, email, username, password, user_type, original_id')
      .or(`email.eq.${emailOrUsername},username.eq.${emailOrUsername}`)
      .not('password', 'is', null)
      .limit(1);

    const userLogin = userLogins?.[0];
    console.log('User login query result:', { found: !!userLogin, error: loginError });

    if (!userLogin) {
      console.log('User not found in user_login table');
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid credentials' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      );
    }

    // Verify password
    if (userLogin.password !== password) {
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

    // Determine user role based on user_type
    let userRole = 'user';

    // Check if super admin
    if (userLogin.email === 'admin@roririsoft.com' || userLogin.username === 'admin') {
      userRole = 'super_admin';
    } else if (userLogin.user_type === 'profile') {
      // For profiles, check user_roles table for admin
      const { data: adminRole } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', userLogin.original_id)
        .eq('role', 'admin')
        .single();

      if (adminRole) {
        userRole = 'admin';
      } else {
        // Check if employee
        const { data: employee } = await supabaseAdmin
          .from('employees')
          .select('id')
          .eq('profile_id', userLogin.original_id)
          .single();

        if (employee) {
          userRole = 'employee';
        }
      }
    } else if (userLogin.user_type === 'student') {
      // Students are trainees
      userRole = 'trainee';
    } else if (userLogin.user_type === 'internship_candidate') {
      // Internship candidates are interns
      userRole = 'intern';
    } else if (userLogin.user_type === 'College' || userLogin.user_type === 'School' || userLogin.user_type === 'Institute') {
      // College, School, or Institute users go to institute dashboard
      userRole = 'college';
    }

    console.log('User role determined:', userRole);

    // Check if user exists in auth.users, if not create them
    // This ensures the user can sign in with Supabase Auth for RLS to work
    const email = userLogin.email;
    if (email) {
      // Check if user exists in auth.users
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find((u: any) => u.email === email);
      
      if (!existingUser) {
        console.log('Creating auth user for:', email);
        // Create the user in auth.users
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true, // Auto-confirm the email
          user_metadata: {
            role: userRole,
            original_id: userLogin.original_id
          }
        });
        
        if (createError) {
          console.error('Error creating auth user:', createError);
        } else {
          console.log('Auth user created:', newUser?.user?.id);
        }
      } else {
        // Update the user's password if it changed
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          existingUser.id,
          { password: password }
        );
        
        if (updateError) {
          console.error('Error updating auth user password:', updateError);
        }
      }
    }

    // Return the user info and role
    return new Response(
      JSON.stringify({
        success: true,
        email: userLogin.email,
        role: userRole,
        userId: userLogin.original_id
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