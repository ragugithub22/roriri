import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Certificate } from "@/components/it-academy/Certificate";

export default function CertificatePage() {
  const navigate = useNavigate();
  const [certificateData, setCertificateData] = useState<any>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('certificateData');
    
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setCertificateData(data);
      } catch (error) {
        console.error('Failed to parse certificate data:', error);
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);

  if (!certificateData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading certificate...</p>
      </div>
    );
  }

  return <Certificate certificateData={certificateData} />;
}
