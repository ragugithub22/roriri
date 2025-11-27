// @ts-nocheck
import FarmLayout from "@/components/farm/FarmLayout";
import FarmAnnouncementsManager from "@/components/farm/FarmAnnouncementsManager";

const FarmAnnouncementsPage = () => {
  return (
    <FarmLayout activeSection="announcements">
      <FarmAnnouncementsManager />
    </FarmLayout>
  );
};

export default FarmAnnouncementsPage;
