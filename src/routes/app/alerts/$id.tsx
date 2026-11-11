import { createFileRoute } from "@tanstack/react-router";
import { AlertDetailScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/alerts/$id")({
  component: function AlertDetailRoute() {
    const { id } = Route.useParams();
    return <AlertDetailScreen id={id} />;
  },
});
