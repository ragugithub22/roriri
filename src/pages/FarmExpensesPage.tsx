import FarmLayout from "@/components/farm/FarmLayout";
import FarmExpensesManager from "@/components/farm/FarmExpensesManager";

const FarmExpensesPage = () => {
  return (
    <FarmLayout activeSection="expenses">
      <FarmExpensesManager />
    </FarmLayout>
  );
};

export default FarmExpensesPage;
