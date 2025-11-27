// @ts-nocheck
import FarmLayout from "@/components/farm/FarmLayout";
import FarmTicketsManager from "@/components/farm/FarmTicketsManager";

const FarmTicketsPage = () => {
  return (
    <FarmLayout activeSection="tickets">
      <FarmTicketsManager />
    </FarmLayout>
  );
};

export default FarmTicketsPage;
