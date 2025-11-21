import FarmLayout from "@/components/farm/FarmLayout";
import FarmVisitorEntryManager from "@/components/farm/FarmVisitorEntryManager";

const FarmVisitorEntryPage = () => {
  return (
    <FarmLayout activeSection="visitors">
      <FarmVisitorEntryManager />
    </FarmLayout>
  );
};

export default FarmVisitorEntryPage;
