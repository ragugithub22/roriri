// @ts-ignore: ESM imports work in Deno runtime
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore: ESM imports work in Deno runtime
import { Resend } from "https://esm.sh/resend@2.0.0";

// @ts-ignore: Deno global is available in Supabase Edge Functions
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendLetterRequest {
  recipientEmail: string;
  recipientName: string;
  letterType: "offer" | "bonafide";
  letterHTML: string;
  subject: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, recipientName, letterType, letterHTML, subject }: SendLetterRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Roriri Software Solutions <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: subject,
      html: letterHTML,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-internship-letter function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
