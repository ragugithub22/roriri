import { format } from "date-fns";

interface BonafideLetterProps {
  candidateName: string;
  position: string;
  startDate: string;
  endDate: string;
}

export const BonafideLetter = ({ candidateName, position, startDate, endDate }: BonafideLetterProps) => {
  return (
    <div className="bg-white p-12 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Roriri SOFTWARE SOLUTIONS</h1>
        <h2 className="text-xl font-semibold">BONAFIDE INTERNSHIP CERTIFICATE</h2>
      </div>

      <div className="mb-6">
        <p className="text-sm">Date: {format(new Date(), "MMMM dd, yyyy")}</p>
      </div>

      <div className="mb-6 leading-relaxed">
        <p>
          This is to certify that <strong>Mr./Ms. {candidateName}</strong> has successfully pursued 
          his/her internship at <strong>Roriri Software Solutions Pvt. Ltd.</strong> in <strong>{position}</strong> from{" "}
          <strong>{format(new Date(startDate), "dd MMMM, yyyy")}</strong> to{" "}
          <strong>{format(new Date(endDate), "dd MMMM, yyyy")}</strong>.
        </p>
      </div>

      <div className="mb-6 leading-relaxed">
        <p>
          During his/her internship, he/she demonstrated keen interest in creativity, and dedication in 
          learning user interface and user experience design principles and contributed positively to the 
          assigned tasks and projects.
        </p>
      </div>

      <div className="mb-8">
        <p className="leading-relaxed">
          We wish him/her all the best in his/her future academic and professional endeavors.
        </p>
      </div>

      <div className="mt-12">
        <p className="mb-1">Best regards,</p>
        <p className="font-semibold mt-4">Ragupathi R,</p>
        <p className="text-sm">Chief Executive Officer (CEO),</p>
        <p className="text-sm">Roriri Software Solutions Pvt. Ltd.</p>
      </div>

      <div className="mt-8 text-sm">
        <p>Reg.No.: 164206</p>
        <p>+91 73389 41579 | +91 96770 18421</p>
        <p>services@roririsoft.com</p>
        <p>www.roririsoft.com</p>
        <p>RORIRI IT PARK</p>
        <p>Kalakad, Tirunelveli - 627502</p>
      </div>
    </div>
  );
};

export const generateBonafideLetterHTML = (data: BonafideLetterProps) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 800px; margin: 0 auto; padding: 48px; }
        .header { text-center; margin-bottom: 32px; }
        h1 { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
        h2 { font-size: 20px; font-weight: 600; }
        .section { margin-bottom: 24px; line-height: 1.6; }
        .signature { margin-top: 48px; }
        .contact { margin-top: 32px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Roriri SOFTWARE SOLUTIONS</h1>
          <h2>BONAFIDE INTERNSHIP CERTIFICATE</h2>
        </div>
        
        <div class="section">
          <p>Date: ${format(new Date(), "MMMM dd, yyyy")}</p>
        </div>

        <div class="section">
          <p>
            This is to certify that <strong>Mr./Ms. ${data.candidateName}</strong> has successfully pursued 
            his/her internship at <strong>Roriri Software Solutions Pvt. Ltd.</strong> in <strong>${data.position}</strong> from 
            <strong>${format(new Date(data.startDate), "dd MMMM, yyyy")}</strong> to 
            <strong>${format(new Date(data.endDate), "dd MMMM, yyyy")}</strong>.
          </p>
        </div>

        <div class="section">
          <p>
            During his/her internship, he/she demonstrated keen interest in creativity, and dedication in 
            learning user interface and user experience design principles and contributed positively to the 
            assigned tasks and projects.
          </p>
        </div>

        <div class="section">
          <p>We wish him/her all the best in his/her future academic and professional endeavors.</p>
        </div>

        <div class="signature">
          <p>Best regards,</p>
          <p style="font-weight: 600; margin-top: 16px;">Ragupathi R,</p>
          <p>Chief Executive Officer (CEO),</p>
          <p>Roriri Software Solutions Pvt. Ltd.</p>
        </div>

        <div class="contact">
          <p>Reg.No.: 164206</p>
          <p>+91 73389 41579 | +91 96770 18421</p>
          <p>services@roririsoft.com</p>
          <p>www.roririsoft.com</p>
          <p>RORIRI IT PARK</p>
          <p>Kalakad, Tirunelveli - 627502</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
