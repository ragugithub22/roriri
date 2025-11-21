import FoundationLayout from "@/components/foundation/FoundationLayout";
import ExpensesManager from "@/components/foundation/ExpensesManager";

const ExpensesPage = () => {
  return (
    <FoundationLayout activeSection="expenses">
      <ExpensesManager />
    </FoundationLayout>
  );
};

export default ExpensesPage;
