import { createFileRoute } from "@tanstack/react-router";
import { EventDetailScreen } from "@/screens/common/CommonScreens";

export const Route = createFileRoute("/app/events/$id")({
  component: function EventDetailRoute() {
    const { id } = Route.useParams();
    return <EventDetailScreen id={id} />;
  },
});
