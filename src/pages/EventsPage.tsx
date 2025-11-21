import FoundationLayout from "@/components/foundation/FoundationLayout";
import EventsManager from "@/components/foundation/EventsManager";

const EventsPage = () => {
  return (
    <FoundationLayout activeSection="events">
      <EventsManager />
    </FoundationLayout>
  );
};

export default EventsPage;
