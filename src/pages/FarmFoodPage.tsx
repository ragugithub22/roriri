import FarmLayout from "@/components/farm/FarmLayout";
import FarmFoodManager from "@/components/farm/FarmFoodManager";

const FarmFoodPage = () => {
  return (
    <FarmLayout activeSection="food">
      <FarmFoodManager />
    </FarmLayout>
  );
};

export default FarmFoodPage;
