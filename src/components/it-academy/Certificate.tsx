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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Print Button - Hidden on print */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 print:hidden">
        <Button onClick={handlePrint} className="gap-2 shadow-lg">
          <Download className="h-4 w-4" />
          Download Certificate
        </Button>
      </div>

      <div id="certificate-content" className="relative w-full max-w-7xl mx-auto" style={{ aspectRatio: '297/210' }}>
        {/* Main Certificate Container - A4 Landscape */}
        <div className="absolute inset-0 bg-white p-6 sm:p-8 md:p-12 lg:p-16 shadow-2xl">
          {/* Top Right Decorative Shape */}
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 overflow-hidden">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {/* Pink/Magenta Triangle */}
              <polygon points="100,0 200,0 200,100" fill="#C41E56" />
              {/* Navy Blue Section */}
              <polygon points="200,0 200,150 150,0" fill="#1E3A5F" />
              {/* Yellow/Orange Section */}
              <polygon points="200,150 200,200 150,200" fill="#F5A623" />
            </svg>
            {/* Roriri Logo */}
            <div className="absolute top-3 right-3 sm:top-6 sm:right-6 w-10 h-10 sm:w-16 sm:h-16">
              <img src="/roriri-logo.png" alt="Roriri Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Bottom Left Decorative Shape */}
          <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 overflow-hidden">
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
            <div className="absolute right-4 sm:right-6 md:right-8 top-16 sm:top-24 md:top-32" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider">
                Certificate of <span className="text-yellow-600">Completion</span>
              </h1>
            </div>

            {/* Left Side Labels */}
            <div className="absolute left-4 sm:left-6 md:left-8 bottom-16 sm:bottom-24 md:bottom-32 space-y-4 sm:space-y-6 md:space-y-8">
              <div style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                <p className="text-xs sm:text-sm">Authorized Signature</p>
                <div className="w-px h-12 sm:h-16 md:h-24 bg-black mx-auto my-2 sm:my-3 md:my-4"></div>
              </div>
              <div style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                <p className="text-xs sm:text-sm">Date issued</p>
              </div>
            </div>

            {/* Center Content */}
            <div className="flex-1 flex items-center justify-center px-16 sm:px-20 md:px-28 lg:px-32">
              <div className="text-center space-y-3 sm:space-y-4 md:space-y-6 max-w-2xl">
                <div style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }} className="inline-block">
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
                    This is to certify that{" "}
                    <span className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl">{certificateData.traineeName}</span>
                    {" "}has successfully completed the{" "}
                    <span className="font-bold text-base sm:text-lg md:text-xl lg:text-2xl">{certificateData.courseName}</span>
                    {" "}to
                  </p>
                </div>

                <div className="border-l-2 border-dotted border-black pl-4 sm:pl-6 md:pl-8 ml-4 sm:ml-6 md:ml-8">
                  <div style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                    <p className="text-xs sm:text-sm leading-relaxed">
                      Their dedication and enthusiasm have set a benchmark of excellence,
                      reflecting the core values of Roriri Software Solutions.
                      We are honored to have been part of their journey and excited to see
                      the impact they will make in their future endeavours
                    </p>
                  </div>
                </div>

                <div style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }} className="inline-block pt-4 sm:pt-6 md:pt-8">
                  <p className="text-sm sm:text-base md:text-lg font-semibold">at Roriri Software Solutions</p>
                  <p className="text-xs sm:text-sm mt-1 sm:mt-2">Private Limited</p>
                </div>
              </div>
            </div>

            {/* Bottom Right - Certifications */}
            <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 right-6 sm:right-8 md:right-12 flex flex-col items-center space-y-1 sm:space-y-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <img src="/roriri-logo.png" alt="DPIIT" className="w-6 h-6 sm:w-8 sm:h-8" />
                <span className="text-[8px] sm:text-xs font-semibold leading-tight">DPIIT<br />RECOGNISED</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <img src="/roriri-logo.png" alt="ISO" className="w-6 h-6 sm:w-8 sm:h-8" />
                <span className="text-[8px] sm:text-xs font-semibold leading-tight">ISO 9001 - 17000<br />CERTIFIED</span>
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
            box-shadow: none;
          }
          @page {
            margin: 0;
            size: A4 landscape;
          }
        }
        
        @media (max-width: 640px) {
          #certificate-content {
            min-height: 100vh;
          }
        }
      `}</style>
    </div>
  );
}
