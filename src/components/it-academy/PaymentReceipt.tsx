import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface PaymentReceiptProps {
  receiptData: {
    payment_code?: string;
    receipt_id?: string;
    payment_date: string;
    amount?: number;
    paid_amount?: number;
    payment_method?: string;
    payment_mode?: string;
    studentName?: string;
    candidateName?: string;
    courseName: string;
    totalFees: number;
    balance: number;
  };
}

export function PaymentReceipt({ receiptData }: PaymentReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  const receiptId = receiptData.payment_code || receiptData.receipt_id || 'N/A';
  const paidAmount = receiptData.amount || receiptData.paid_amount || 0;
  const paymentMethod = receiptData.payment_method || receiptData.payment_mode || 'N/A';
  const studentName = receiptData.studentName || receiptData.candidateName || 'N/A';

  useEffect(() => {
    // Set page title for the receipt
    document.title = `Receipt - ${receiptId}`;
  }, [receiptId]);

  return (
    <div className="min-h-screen bg-white">
      {/* Print Button - Hidden on print */}
      <div className="flex justify-center gap-4 p-6 print:hidden bg-gray-50 sticky top-0 z-10 shadow-sm">
        <Button onClick={handlePrint} className="gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <div id="receipt-content" className="max-w-4xl mx-auto p-8 md:p-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 mb-8">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img 
              src="/logo.png" 
              alt="Roriri Logo" 
              className="w-24 h-24 md:w-32 md:h-32 object-contain"
            />
          </div>

          {/* Company Info */}
          <div className="flex-1 text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">RORIRI SOFTWARE SOLUTIONS PVT.LTD.</h1>
            <p className="text-xs md:text-sm">RORIRI IT PARK, NALLANATHAPURAM, Kalakkad, Keela</p>
            <p className="text-xs md:text-sm">Karuvelankulam, Tamil Nadu 627502</p>
          </div>
        </div>

        {/* Payment Receipt Title */}
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-2xl font-bold">Payment Receipt</h2>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8">
          <div>
            <p className="mb-2 text-sm md:text-base">
              <span className="font-semibold">Course Name :</span> {receiptData.courseName}
            </p>
          </div>
          <div className="md:text-right">
            <p className="mb-2 text-sm md:text-base">
              <span className="font-semibold">Student Name :</span> {studentName}
            </p>
          </div>
          <div>
            <p className="text-sm md:text-base">
              <span className="font-semibold">Date :</span>{" "}
              {new Date(receiptData.payment_date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Payment Table */}
        <div className="border border-black mb-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black">
                <th className="py-3 px-3 md:px-4 text-left font-semibold text-sm md:text-base">Description</th>
                <th className="py-3 px-3 md:px-4 text-center font-semibold border-l border-black text-sm md:text-base">Method</th>
                <th className="py-3 px-3 md:px-4 text-right font-semibold border-l border-black text-sm md:text-base">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-3 md:px-4 text-sm md:text-base">Fees</td>
                <td className="py-3 px-3 md:px-4 text-center border-l border-black capitalize text-sm md:text-base">
                  {paymentMethod}
                </td>
                <td className="py-3 px-3 md:px-4 text-right border-l border-black text-sm md:text-base">
                  Rs. {Number(paidAmount).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-full md:w-64 space-y-2">
            <div className="flex justify-between py-2 border-t border-black text-sm md:text-base">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">Rs. {Number(paidAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm md:text-base">
              <span className="font-semibold">Balance</span>
              <span className="font-semibold">Rs. {Number(receiptData.balance).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="italic text-sm md:text-base">Thank you for your payment!</p>
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
          #receipt-content {
            max-width: 100%;
            padding: 1.5cm;
          }
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
}
