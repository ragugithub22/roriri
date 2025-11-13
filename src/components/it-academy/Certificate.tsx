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
        <div className="absolute inset-0 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
          {/* Top Left - Curved Abstract Design */}
          <div className="absolute top-0 left-0 w-[45%] h-[25%] overflow-visible" style={{ zIndex: 1 }}>
            <svg viewBox="0 0 600 300" className="w-full h-full" preserveAspectRatio="none">
              {/* Navy/Purple curved shape */}
              <path d="M 0,0 L 0,300 Q 250,200 350,0 Z" fill="#2D1B4E" />
              {/* Pink curved shape */}
              <path d="M 0,150 L 0,300 Q 200,250 300,150 L 300,300 L 0,300 Z" fill="#E91E63" />
              {/* Yellow curved shape */}
              <path d="M 350,0 Q 250,200 600,180 L 600,0 Z" fill="#FFC107" />
            </svg>
          </div>

          {/* Top Left Logo */}
          <div className="absolute top-6 left-6 sm:top-8 sm:left-8 md:top-10 md:left-12 z-10">
            <img
              src="/roriri-logo.png"
              alt="Roriri Logo"
              className="h-12 sm:h-14 md:h-16 w-auto object-contain"
            />
          </div>

          {/* Top Right - Certification Logos */}
          <div className="absolute top-6 right-6 sm:top-8 sm:right-8 md:top-10 md:right-12 flex gap-4 sm:gap-6 items-center z-10">
            <div className="h-10 sm:h-12 md:h-14 w-auto bg-white/80 rounded px-2 py-1 flex items-center justify-center">
              <span className="text-[8px] sm:text-[10px] md:text-xs font-bold text-gray-800">DPIIT</span>
            </div>
            <div className="h-10 sm:h-12 md:h-14 w-auto bg-white/80 rounded px-2 py-1 flex items-center justify-center">
              <span className="text-[8px] sm:text-[10px] md:text-xs font-bold text-gray-800">StartupIndia</span>
            </div>
            <div className="h-10 sm:h-12 md:h-14 w-auto bg-white/80 rounded px-2 py-1 flex items-center justify-center">
              <span className="text-[8px] sm:text-[10px] md:text-xs font-bold text-gray-800">MSME</span>
            </div>
            <div className="h-10 sm:h-12 md:h-14 w-auto bg-white/80 rounded px-2 py-1 flex items-center justify-center">
              <span className="text-[8px] sm:text-[10px] md:text-xs font-bold text-gray-800">ISO 9001-27001</span>
            </div>
          </div>

          {/* Bottom Right - Curved Design */}
          <div className="absolute bottom-0 right-0 w-[45%] h-[25%] overflow-visible" style={{ zIndex: 1 }}>
            <svg viewBox="0 0 600 300" className="w-full h-full" preserveAspectRatio="none">
              {/* Purple curved shape */}
              <path d="M 600,300 L 600,0 Q 350,100 250,300 Z" fill="#2D1B4E" />
              {/* Pink curved shape */}
              <path d="M 250,300 Q 350,100 600,0 L 600,150 Q 400,200 300,300 Z" fill="#E91E63" />
            </svg>
          </div>

          {/* Certificate Text */}
          <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-8 sm:px-12 md:px-20 py-12 sm:py-16 md:py-20">
            <div className="mb-6 sm:mb-8">
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 font-light mb-2">
                Certificate of
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-black">
                Completion
              </h1>
            </div>

            <div className="max-w-4xl text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed text-gray-800 space-y-4 sm:space-y-6">
              <p>
                This is to certify that{" "}
                <span className="border-b-2 border-dotted border-gray-400 px-2 font-semibold">
                  {certificateData.traineeName}
                </span>{" "}
                has successfully
              </p>
              
              <p>
                completed the{" "}
                <span className="border-b-2 border-dotted border-gray-400 px-2 font-semibold">
                  {certificateData.courseName}
                </span>{" "}
                held from
              </p>
              
              <p>
                <span className="border-b-2 border-dotted border-gray-400 px-2 font-semibold">
                  {certificateData.issue_date}
                </span>{" "}
                to{" "}
                <span className="border-b-2 border-dotted border-gray-400 px-2 font-semibold">
                  {certificateData.issue_date}
                </span>{" "}
                at Roriri Software Solutions
              </p>
              
              <p className="font-semibold">Private Limited</p>
            </div>

            <p className="text-sm sm:text-base md:text-lg text-gray-700 max-w-3xl mt-8 sm:mt-10 md:mt-12 leading-relaxed">
              Their dedication, and enthusiasm have set a benchmark of excellence,
              reflecting the core values of Roriri Software Solutions. We are honored
              to have been part of their journey and excited to see the impact they will
              make in their future endeavors.
            </p>

            {/* Footer Info */}
            <div className="mt-12 sm:mt-16 md:mt-20 w-full flex justify-between items-end px-6 sm:px-10 md:px-16">
              <div className="text-left">
                <div className="w-40 sm:w-48 border-b-2 border-gray-400 mb-2"></div>
                <p className="text-sm sm:text-base md:text-lg text-gray-700 italic">
                  Date Issued
                </p>
              </div>

              <div className="text-right">
                <div className="w-40 sm:w-48 border-b-2 border-gray-400 mb-2 ml-auto"></div>
                <p className="text-sm sm:text-base md:text-lg text-gray-700 italic">
                  Authorized Signature
                </p>
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
