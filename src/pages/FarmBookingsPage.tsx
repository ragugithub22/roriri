import FarmLayout from "@/components/farm/FarmLayout";
import FarmBookingsManager from "@/components/farm/FarmBookingsManager";

const FarmBookingsPage = () => {
  return (
    <FarmLayout activeSection="bookings">
      <FarmBookingsManager />
    </FarmLayout>
  );
};

export default FarmBookingsPage;
