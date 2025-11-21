import FoundationLayout from "@/components/foundation/FoundationLayout";
import VolunteersManager from "@/components/foundation/VolunteersManager";

const VolunteersPage = () => {
  return (
    <FoundationLayout activeSection="volunteers">
      <VolunteersManager />
    </FoundationLayout>
  );
};

export default VolunteersPage;
