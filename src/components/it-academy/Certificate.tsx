import { useEffect, useState } from "react";
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

  const BASE_WIDTH = 1400;
  const BASE_HEIGHT = 990;
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const recalc = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const s = Math.min(vw / BASE_HEIGHT, vh / BASE_WIDTH);
      setScale(s);
    };
    recalc();
    window.addEventListener("resize", recalc);
    return () => window.removeEventListener("resize", recalc);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden">
      {/* Download Button (hidden during print) */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 print:hidden">
        <Button onClick={handlePrint} className="gap-2 shadow-lg">
          <Download className="h-4 w-4" />
          Download Certificate
        </Button>
      </div>

      {/* Certificate Layout */}
      <div
        id="certificate-content"
        className="relative mx-auto rotate-certificate"
        style={{
          width: `${BASE_WIDTH}px`,
          height: `${BASE_HEIGHT}px`,
          ["--scale" as any]: `${scale}`,
        }}
      >
        <div className="absolute inset-0 bg-white rounded-xl shadow-2xl p-6 sm:p-10 md:p-12 lg:p-16 overflow-hidden flex flex-col">
          {/* Top Right Design */}
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 overflow-hidden">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <polygon points="100,0 200,0 200,100" fill="#C41E56" />
              <polygon points="200,0 200,150 150,0" fill="#1E3A5F" />
              <polygon points="200,150 200,200 150,200" fill="#F5A623" />
            </svg>
            <div className="absolute top-3 right-3 sm:top-6 sm:right-6 w-10 h-10 sm:w-16 sm:h-16">
              <img
                src="/roriri-logo.png"
                alt="Roriri Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Bottom Left Design */}
          <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 overflow-hidden">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <polygon points="0,100 0,200 100,200" fill="#2D1B4E" />
              <polygon points="0,200 150,200 0,50" fill="#C41E56" />
            </svg>
          </div>

          {/* Certificate Text */}
          <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-8 sm:px-12 md:px-20">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-wide mb-4">
              Certificate of <span className="text-yellow-600">Completion</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl leading-relaxed max-w-3xl">
              This is to certify that{" "}
              <span className="font-bold text-xl sm:text-2xl md:text-3xl">
                {certificateData.traineeName}
              </span>{" "}
              has successfully completed the{" "}
              <span className="font-bold text-xl sm:text-2xl md:text-3xl">
                {certificateData.courseName}
              </span>{" "}
              course.
            </p>

            <p className="text-sm sm:text-base md:text-lg text-gray-700 max-w-2xl mt-6">
              Their dedication and enthusiasm have set a benchmark of excellence,
              reflecting the core values of Roriri Software Solutions.
              We are honored to have been part of their journey and excited to
              see the impact they will make in their future endeavors.
            </p>

            <p className="text-sm sm:text-base md:text-lg font-semibold mt-6">
              Issued on: {certificateData.issue_date}
            </p>

            {/* Footer Info */}
            <div className="mt-10 sm:mt-12 md:mt-16 w-full flex justify-between items-center px-10">
              <div>
                <p className="text-sm sm:text-base md:text-lg font-semibold">
                  Authorized Signature
                </p>
                <div className="w-32 border-b-2 border-black mt-2"></div>
              </div>

              <div className="text-right">
                <p className="text-sm sm:text-base md:text-lg font-semibold">
                  Roriri Software Solutions
                </p>
                <p className="text-xs sm:text-sm">Private Limited</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .rotate-certificate {
          transform: rotate(-90deg) scale(var(--scale, 1));
          transform-origin: center center;
          transition: transform 0.3s ease;
        }

        @media (max-width: 768px) {
          .rotate-certificate {
            transform: none !important;
            width: 100% !important;
            height: auto !important;
          }
        }

        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          .rotate-certificate {
            transform: none !important;
          }
          #certificate-content {
            width: 297mm !important;
            height: 210mm !important;
            box-shadow: none;
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
