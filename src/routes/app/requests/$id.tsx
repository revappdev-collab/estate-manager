import { createFileRoute } from "@tanstack/react-router";
import { RequestDetailScreen } from "@/screens/requests/RequestScreens";

export const Route = createFileRoute("/app/requests/$id")({
  component: function RequestDetailRoute() {
    const { id } = Route.useParams();
    return <RequestDetailScreen id={id} />;
  },
});
