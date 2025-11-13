import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

interface PaymentReceiptProps {
  receiptData: {
    payment_code: string;
    payment_date: string;
    amount: number;
    payment_method: string;
    studentName: string;
    courseName: string;
    totalFees: number;
    balance: number;
  };
  onClose: () => void;
}

export function PaymentReceipt({ receiptData, onClose }: PaymentReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-white">
        <div className="flex justify-end p-4 print:hidden">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div id="receipt-content" className="p-12">
          {/* Header */}
          <div className="flex items-start gap-8 mb-8">
            {/* Logo */}
            <div className="flex-shrink-0">
              <svg
                width="100"
                height="100"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="30" cy="25" r="8" fill="#E91E63" />
                <circle cx="50" cy="20" r="8" fill="#FF9800" />
                <path
                  d="M20 50 L40 70 M40 50 L20 70"
                  stroke="#2196F3"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M60 50 L80 70 M80 50 L60 70"
                  stroke="#FF9800"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <rect x="35" y="75" width="30" height="20" rx="4" fill="#4CAF50" />
              </svg>
            </div>

            {/* Company Info */}
            <div className="flex-1 text-center">
              <h1 className="text-3xl font-bold mb-2">RORIRI SOFTWARE SOLUTIONS PVT.LTD.</h1>
              <p className="text-sm">RORIRI IT PARK, NALLANATHAPURAM, Kalakkad, Keela</p>
              <p className="text-sm">Karuvelankulam, Tamil Nadu 627502</p>
            </div>
          </div>

          {/* Payment Receipt Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Payment Receipt</h2>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="mb-2">
                <span className="font-semibold">Course Name :</span> {receiptData.courseName}
              </p>
            </div>
            <div className="text-right">
              <p className="mb-2">
                <span className="font-semibold">Student Name :</span> {receiptData.studentName}
              </p>
            </div>
            <div>
              <p>
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
          <div className="border border-black mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black">
                  <th className="py-3 px-4 text-left font-semibold">Description</th>
                  <th className="py-3 px-4 text-center font-semibold border-l border-black">Method</th>
                  <th className="py-3 px-4 text-right font-semibold border-l border-black">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 px-4">Fees</td>
                  <td className="py-3 px-4 text-center border-l border-black capitalize">
                    {receiptData.payment_method}
                  </td>
                  <td className="py-3 px-4 text-right border-l border-black">
                    Rs. {Number(receiptData.amount).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between py-2 border-t border-black">
                <span className="font-semibold">Total</span>
                <span className="font-semibold">Rs. {Number(receiptData.amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold">Balance</span>
                <span className="font-semibold">Rs. {Number(receiptData.balance).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <p className="italic">Thank you for your payment!</p>
          </div>
        </div>

        {/* Print Button */}
        <div className="flex justify-center gap-4 p-6 border-t print:hidden">
          <Button onClick={handlePrint} className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </DialogContent>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content,
          #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </Dialog>
  );
}
