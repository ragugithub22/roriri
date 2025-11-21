import FoundationLayout from "@/components/foundation/FoundationLayout";
import BeneficiariesManager from "@/components/foundation/BeneficiariesManager";

const BeneficiariesPage = () => {
  return (
    <FoundationLayout activeSection="beneficiaries">
      <BeneficiariesManager />
    </FoundationLayout>
  );
};

export default BeneficiariesPage;
