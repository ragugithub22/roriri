import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PaymentReceipt } from "@/components/it-academy/PaymentReceipt";

export default function ReceiptPage() {
  const navigate = useNavigate();
  const [receiptData, setReceiptData] = useState<any>(null);

  useEffect(() => {
    // Get receipt data from localStorage
    const storedData = localStorage.getItem('receiptData');
    
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setReceiptData(data);
      } catch (error) {
        console.error('Failed to parse receipt data:', error);
        navigate('/');
      }
    } else {
      // Redirect if no receipt data found
      navigate('/');
    }
  }, [navigate]);

  if (!receiptData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading receipt...</p>
      </div>
    );
  }

  return <PaymentReceipt receiptData={receiptData} />;
}
