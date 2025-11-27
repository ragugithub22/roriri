// @ts-nocheck
import FarmLayout from "@/components/farm/FarmLayout";
import FarmPaymentsManager from "@/components/farm/FarmPaymentsManager";

const FarmPaymentsPage = () => {
  return (
    <FarmLayout activeSection="payments">
      <FarmPaymentsManager />
    </FarmLayout>
  );
};

export default FarmPaymentsPage;
