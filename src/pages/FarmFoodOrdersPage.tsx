// @ts-nocheck
import FarmLayout from "@/components/farm/FarmLayout";
import FarmFoodOrdersManager from "@/components/farm/FarmFoodOrdersManager";

const FarmFoodOrdersPage = () => {
  return (
    <FarmLayout activeSection="food-orders">
      <FarmFoodOrdersManager />
    </FarmLayout>
  );
};

export default FarmFoodOrdersPage;
