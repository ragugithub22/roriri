// @ts-nocheck
import FarmLayout from "@/components/farm/FarmLayout";
import FarmSettingsManager from "@/components/farm/FarmSettingsManager";

const FarmSettingsPage = () => {
  return (
    <FarmLayout activeSection="settings">
      <FarmSettingsManager />
    </FarmLayout>
  );
};

export default FarmSettingsPage;
