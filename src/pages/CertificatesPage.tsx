import FoundationLayout from "@/components/foundation/FoundationLayout";
import CertificatesManager from "@/components/foundation/CertificatesManager";

const CertificatesPage = () => {
  return (
    <FoundationLayout activeSection="certificates">
      <CertificatesManager />
    </FoundationLayout>
  );
};

export default CertificatesPage;
