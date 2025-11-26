import { format } from "date-fns";

interface OfferLetterProps {
  candidateName: string;
  position: string;
  joiningDate: string;
  duration: string;
}

export const OfferLetter = ({ candidateName, position, joiningDate, duration }: OfferLetterProps) => {
  return (
    <div className="bg-white p-12 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Internship Offer Letter</h1>
      </div>

      <div className="mb-6">
        <p className="text-sm">Date: {format(new Date(), "MMMM dd, yyyy")}</p>
      </div>

      <div className="mb-6">
        <p>Dear {candidateName},</p>
      </div>

      <div className="mb-6">
        <p className="leading-relaxed">
          We are pleased to offer you an Internship opportunity at <strong>RORIRI Software Solutions</strong>. 
          We appreciate your enthusiasm and potential and believe this internship will provide you with 
          valuable industry experience.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Internship Details:</h2>
        <ul className="list-none space-y-2">
          <li>• <strong>Position:</strong> {position}</li>
          <li>• <strong>Start Date:</strong> {format(new Date(joiningDate), "MMMM dd, yyyy")}</li>
          <li>• <strong>Duration:</strong> {duration}</li>
          <li>• <strong>Location:</strong> Roriri Software Solution Pvt. Ltd, Nallanathapuram, Kalakad</li>
          <li>• <strong>Stipend:</strong> Unpaid Internship</li>
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Internship Terms & Future Opportunities:</h2>
        <ul className="list-none space-y-2">
          <li>• During the internship, you will work on {position}.</li>
          <li>• Your performance will be evaluated during the internship period.</li>
          <li>• Upon successful completion of the internship, based on your performance and company requirements, 
              we may offer you a full-time position with a fixed salary.</li>
        </ul>
      </div>

      <div className="mb-8">
        <p className="leading-relaxed">
          We are excited to have you as part of our team and look forward to seeing your contributions.
        </p>
        <p className="leading-relaxed mt-4">
          Congratulations once again, and welcome to Roriri Software Solution Pvt. Ltd,
        </p>
      </div>

      <div className="mt-12">
        <p className="mb-1">Best regards,</p>
        <p className="font-semibold mt-4">Ragupathi</p>
        <p className="text-sm">Chief Executive Officer (CEO),</p>
        <p className="text-sm">Roriri Software Solutions.</p>
      </div>
    </div>
  );
};

export const generateOfferLetterHTML = (data: OfferLetterProps) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 800px; margin: 0 auto; padding: 48px; }
        .header { text-align: center; margin-bottom: 32px; }
        h1 { font-size: 28px; font-weight: bold; margin-bottom: 8px; }
        .section { margin-bottom: 24px; }
        .section h2 { font-size: 20px; font-weight: bold; margin-bottom: 16px; }
        ul { list-style: none; padding: 0; }
        li { margin-bottom: 8px; }
        .signature { margin-top: 48px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Internship Offer Letter</h1>
        </div>
        
        <div class="section">
          <p>Date: ${format(new Date(), "MMMM dd, yyyy")}</p>
        </div>

        <div class="section">
          <p>Dear ${data.candidateName},</p>
        </div>

        <div class="section">
          <p>We are pleased to offer you an Internship opportunity at <strong>RORIRI Software Solutions</strong>. 
          We appreciate your enthusiasm and potential and believe this internship will provide you with 
          valuable industry experience.</p>
        </div>

        <div class="section">
          <h2>Internship Details:</h2>
          <ul>
            <li>• <strong>Position:</strong> ${data.position}</li>
            <li>• <strong>Start Date:</strong> ${format(new Date(data.joiningDate), "MMMM dd, yyyy")}</li>
            <li>• <strong>Duration:</strong> ${data.duration}</li>
            <li>• <strong>Location:</strong> Roriri Software Solution Pvt. Ltd, Nallanathapuram, Kalakad</li>
            <li>• <strong>Stipend:</strong> Unpaid Internship</li>
          </ul>
        </div>

        <div class="section">
          <h2>Internship Terms & Future Opportunities:</h2>
          <ul>
            <li>• During the internship, you will work on ${data.position}.</li>
            <li>• Your performance will be evaluated during the internship period.</li>
            <li>• Upon successful completion of the internship, based on your performance and company requirements, 
                we may offer you a full-time position with a fixed salary.</li>
          </ul>
        </div>

        <div class="section">
          <p>We are excited to have you as part of our team and look forward to seeing your contributions.</p>
          <p style="margin-top: 16px;">Congratulations once again, and welcome to Roriri Software Solution Pvt. Ltd,</p>
        </div>

        <div class="signature">
          <p>Best regards,</p>
          <p style="font-weight: 600; margin-top: 16px;">Ragupathi</p>
          <p>Chief Executive Officer (CEO),</p>
          <p>Roriri Software Solutions.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
