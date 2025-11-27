// @ts-nocheck
import FarmLayout from "@/components/farm/FarmLayout";
import FarmEventsManager from "@/components/farm/FarmEventsManager";

const FarmEventsPage = () => {
  return (
    <FarmLayout activeSection="events">
      <FarmEventsManager />
    </FarmLayout>
  );
};

export default FarmEventsPage;
