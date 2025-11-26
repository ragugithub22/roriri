import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendLetterRequest {
  recipientEmail: string;
  recipientName: string;
  letterType: "offer" | "bonafide" | "completion";
  subject: string;
  courseName?: string;
  startDate?: string;
  endDate?: string;
}

const generateOfferLetterHTML = (name: string, joiningDate: string) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #1a1a1a; font-size: 24px; margin: 10px 0;">Roriri SOFTWARE SOLUTIONS</h2>
      </div>

      <h1 style="text-align: center; color: #1a1a1a; font-size: 28px; margin-bottom: 30px;">INTERNSHIP OFFER LETTER</h1>

      <p style="margin-bottom: 20px;">Dear ${name},</p>

      <p style="margin-bottom: 20px;">
        We are pleased to offer you an internship position at Roriri Software Solutions Pvt Ltd.
        Your internship will commence on ${new Date(joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
      </p>

      <p style="margin-bottom: 20px;">
        We look forward to having you as part of our team and are confident that this internship will be a valuable learning experience for you.
      </p>

      <p style="margin-bottom: 30px;">
        Please confirm your acceptance of this offer by responding to this email.
      </p>

      <p style="margin-bottom: 10px;">Best regards,</p>
      <p style="margin-bottom: 5px; font-weight: bold;">Ragupathi R,</p>
      <p style="margin-bottom: 20px;">Chief Executive Officer (CEO),<br/>Roriri Software Solutions Pvt Ltd</p>
      <p style="margin-bottom: 30px;">Reg.No.: 164206</p>

      <div style="border-top: 2px solid #ddd; padding-top: 20px; margin-top: 40px; font-size: 14px; color: #666;">
        <p style="margin: 5px 0;">📞 +91 73389 41579 | +91 96770 18421</p>
        <p style="margin: 5px 0;">🌐 www.roririsoft.com</p>
        <p style="margin: 5px 0;">📧 services@roririsoft.com</p>
        <p style="margin: 5px 0;">📍 RORIRI IT PARK, Kalakad, Tirunelveli - 627502</p>
      </div>
    </div>
  `;
};

const generateBonafideLetterHTML = (name: string, joiningDate: string) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #1a1a1a; font-size: 24px; margin: 10px 0;">Roriri SOFTWARE SOLUTIONS</h2>
      </div>

      <h1 style="text-align: center; color: #1a1a1a; font-size: 28px; margin-bottom: 30px;">BONAFIDE CERTIFICATE</h1>

      <p style="margin-bottom: 20px;">To Whom It May Concern,</p>

      <p style="margin-bottom: 20px;">
        This is to certify that ${name} is a bonafide intern at Roriri Software Solutions Pvt Ltd,
        having joined us on ${new Date(joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
      </p>

      <p style="margin-bottom: 20px;">
        This certificate is issued at the request of the intern for official purposes.
      </p>

      <p style="margin-bottom: 30px;">
        We wish them all the best in their future endeavors.
      </p>

      <p style="margin-bottom: 10px;">Best regards,</p>
      <p style="margin-bottom: 5px; font-weight: bold;">Ragupathi R,</p>
      <p style="margin-bottom: 20px;">Chief Executive Officer (CEO),<br/>Roriri Software Solutions Pvt Ltd</p>
      <p style="margin-bottom: 30px;">Reg.No.: 164206</p>

      <div style="border-top: 2px solid #ddd; padding-top: 20px; margin-top: 40px; font-size: 14px; color: #666;">
        <p style="margin: 5px 0;">📞 +91 73389 41579 | +91 96770 18421</p>
        <p style="margin: 5px 0;">🌐 www.roririsoft.com</p>
        <p style="margin: 5px 0;">📧 services@roririsoft.com</p>
        <p style="margin: 5px 0;">📍 RORIRI IT PARK, Kalakad, Tirunelveli - 627502</p>
      </div>
    </div>
  `;
};

const generateCompletionLetterHTML = (name: string, courseName: string, startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #1a1a1a; font-size: 24px; margin: 10px 0;">Roriri SOFTWARE SOLUTIONS</h2>
      </div>

      <h1 style="text-align: center; color: #1a1a1a; font-size: 28px; margin-bottom: 30px;">INTERNSHIP COMPLETION LETTER</h1>

      <p style="margin-bottom: 20px;">Dear ${name},</p>

      <p style="margin-bottom: 20px;">
        We are Delighted to acknowledge the Successful completion of your Internship with Roriri Software Solutions Pvt Ltd. 
        Your Internship, which ran from ${formatDate(start)} to ${formatDate(end)} has come to a successful close, 
        and we are pleased to report that you achieved a perfect attendance record throughout this period.
      </p>

      <p style="margin-bottom: 20px;">
        Your commitment to your role and your consistent presence at the office have been truly commendable. 
        Your contributions to our ${courseName} were highly valued, and your dedication and work ethic have not gone unnoticed.
      </p>

      <p style="margin-bottom: 20px;">
        It has been a pleasure having you with us as an intern. You brought a fresh perspective to our team, 
        and we hope that your time here was both insightful and rewarding.
      </p>

      <p style="margin-bottom: 30px;">
        Thank you once again for your exceptional performance and dedication during this ${months} Month${months > 1 ? 's' : ''} of Internship Period.
      </p>

      <p style="margin-bottom: 10px;">Best regards,</p>
      <p style="margin-bottom: 5px; font-weight: bold;">Ragupathi R,</p>
      <p style="margin-bottom: 20px;">Chief Executive Officer (CEO),<br/>Roriri Software Solutions Pvt Ltd</p>
      <p style="margin-bottom: 30px;">Reg.No.: 164206</p>

      <div style="border-top: 2px solid #ddd; padding-top: 20px; margin-top: 40px; font-size: 14px; color: #666;">
        <p style="margin: 5px 0;">📞 +91 73389 41579 | +91 96770 18421</p>
        <p style="margin: 5px 0;">🌐 www.roririsoft.com</p>
        <p style="margin: 5px 0;">📧 services@roririsoft.com</p>
        <p style="margin: 5px 0;">📍 RORIRI IT PARK, Kalakad, Tirunelveli - 627502</p>
      </div>
    </div>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, recipientName, letterType, subject, courseName, startDate, endDate }: SendLetterRequest = await req.json();

    console.log("Sending letter:", { recipientEmail, recipientName, letterType });

    let letterHTML = "";

    if (letterType === "offer") {
      letterHTML = generateOfferLetterHTML(recipientName, startDate || new Date().toISOString());
    } else if (letterType === "bonafide") {
      letterHTML = generateBonafideLetterHTML(recipientName, startDate || new Date().toISOString());
    } else if (letterType === "completion") {
      letterHTML = generateCompletionLetterHTML(
        recipientName, 
        courseName || "team",
        startDate || new Date().toISOString(), 
        endDate || new Date().toISOString()
      );
    }

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
