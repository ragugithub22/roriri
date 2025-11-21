import FoundationLayout from "@/components/foundation/FoundationLayout";
import DonationsManager from "@/components/foundation/DonationsManager";

const DonationsPage = () => {
  return (
    <FoundationLayout activeSection="donations">
      <DonationsManager />
    </FoundationLayout>
  );
};

export default DonationsPage;
