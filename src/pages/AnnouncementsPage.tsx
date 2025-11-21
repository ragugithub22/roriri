import FoundationLayout from "@/components/foundation/FoundationLayout";
import AnnouncementsManager from "@/components/foundation/AnnouncementsManager";

const AnnouncementsPage = () => {
  return (
    <FoundationLayout activeSection="announcements">
      <AnnouncementsManager />
    </FoundationLayout>
  );
};

export default AnnouncementsPage;
