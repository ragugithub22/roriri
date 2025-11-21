import FoundationLayout from "@/components/foundation/FoundationLayout";
import DonorsManager from "@/components/foundation/DonorsManager";

const DonorsPage = () => {
  return (
    <FoundationLayout activeSection="donors">
      <DonorsManager />
    </FoundationLayout>
  );
};

export default DonorsPage;
