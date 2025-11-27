// @ts-nocheck
import FarmLayout from "@/components/farm/FarmLayout";
import FarmGamesManager from "@/components/farm/FarmGamesManager";

const FarmGamesPage = () => {
  return (
    <FarmLayout activeSection="games">
      <FarmGamesManager />
    </FarmLayout>
  );
};

export default FarmGamesPage;
