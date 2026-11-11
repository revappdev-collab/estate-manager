import { createFileRoute } from "@tanstack/react-router";
import { TeamDetailScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/team/$id")({
  component: function TeamDetailRoute() {
    const { id } = Route.useParams();
    return <TeamDetailScreen id={id} />;
  },
});
