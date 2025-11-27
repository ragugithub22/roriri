// @ts-nocheck
import FarmLayout from "@/components/farm/FarmLayout";
import FarmReportsManager from "@/components/farm/FarmReportsManager";

const FarmReportsPage = () => {
  return (
    <FarmLayout activeSection="reports">
      <FarmReportsManager />
    </FarmLayout>
  );
};

export default FarmReportsPage;
