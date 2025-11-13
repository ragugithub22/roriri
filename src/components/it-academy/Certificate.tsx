import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface CertificateProps {
  certificateData: {
    certificate_number: string;
    traineeName: string;
    courseName: string;
    issue_date: string;
  };
}

export function Certificate({ certificateData }: CertificateProps) {
  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    document.title = `Certificate - ${certificateData.certificate_number}`;
  }, [certificateData.certificate_number]);

  return (
    <div className="min-h-screen bg-white">
      {/* Print Button - Hidden on print */}
      <div className="flex justify-center gap-4 p-6 print:hidden bg-gray-50 sticky top-0 z-10 shadow-sm">
        <Button onClick={handlePrint} className="gap-2">
          <Download className="h-4 w-4" />
          Download Certificate
        </Button>
      </div>

      <div id="certificate-content" className="relative w-full" style={{ aspectRatio: '1.414/1' }}>
        {/* Main Certificate Container - A4 Landscape */}
        <div className="absolute inset-0 bg-white p-8 md:p-12">
          {/* Top Right Decorative Shape */}
          <div className="absolute top-0 right-0 w-64 h-64 overflow-hidden">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Pink/Magenta Triangle */}
              <polygon points="100,0 200,0 200,100" fill="#C41E56" />
              {/* Navy Blue Section */}
              <polygon points="200,0 200,150 150,0" fill="#1E3A5F" />
              {/* Yellow/Orange Section */}
              <polygon points="200,150 200,200 150,200" fill="#F5A623" />
            </svg>
            {/* Roriri Logo */}
            <div className="absolute top-6 right-6 w-16 h-16">
              <img src="/logo.png" alt="Roriri Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Bottom Left Decorative Shape */}
          <div className="absolute bottom-0 left-0 w-48 h-48 overflow-hidden">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Navy/Purple Section */}
              <polygon points="0,100 0,200 100,200" fill="#2D1B4E" />
              {/* Magenta Section */}
              <polygon points="0,200 150,200 0,50" fill="#C41E56" />
            </svg>
          </div>

          {/* Main Content */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Right Side - Certificate Title */}
            <div className="absolute right-8 top-32" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
              <h1 className="text-5xl font-bold tracking-wider">
                Certificate of <span className="text-yellow-600">Completion</span>
              </h1>
            </div>

            {/* Left Side Labels */}
            <div className="absolute left-8 bottom-32 space-y-8">
              <div style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                <p className="text-sm">Authorized Signature</p>
                <div className="w-px h-24 bg-black mx-auto my-4"></div>
              </div>
              <div style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                <p className="text-sm">Date issued</p>
              </div>
            </div>

            {/* Center Content */}
            <div className="flex-1 flex items-center justify-center px-32">
              <div className="text-center space-y-6 max-w-2xl">
                <div style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }} className="inline-block">
                  <p className="text-xl leading-relaxed">
                    This is to certify that{" "}
                    <span className="font-bold text-2xl">{certificateData.traineeName}</span>
                    {" "}has successfully completed the{" "}
                    <span className="font-bold text-2xl">{certificateData.courseName}</span>
                    {" "}to
                  </p>
                </div>

                <div className="border-l-2 border-dotted border-black pl-8 ml-8">
                  <div style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                    <p className="text-sm leading-relaxed">
                      Their dedication and enthusiasm have set a benchmark of excellence,
                      reflecting the core values of Roriri Software Solutions.
                      We are honored to have been part of their journey and excited to see
                      the impact they will make in their future endeavours
                    </p>
                  </div>
                </div>

                <div style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }} className="inline-block pt-8">
                  <p className="text-lg font-semibold">at Roriri Software Solutions</p>
                  <p className="text-sm mt-2">Private Limited</p>
                </div>
              </div>
            </div>

            {/* Bottom Right - Certifications */}
            <div className="absolute bottom-8 right-12 flex flex-col items-center space-y-2">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="DPIIT" className="w-8 h-8" />
                <span className="text-xs font-semibold">DPIIT<br />RECOGNISED</span>
              </div>
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="ISO" className="w-8 h-8" />
                <span className="text-xs font-semibold">ISO 9001 - 17000<br />CERTIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          #certificate-content {
            width: 297mm;
            height: 210mm;
            max-width: 100%;
            page-break-after: avoid;
          }
          @page {
            margin: 0;
            size: A4 landscape;
          }
        }
      `}</style>
    </div>
  );
}
