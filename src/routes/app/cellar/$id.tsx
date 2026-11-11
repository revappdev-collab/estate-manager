import { createFileRoute } from "@tanstack/react-router";
import { CellarDetailScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/cellar/$id")({
  component: function CellarDetailRoute() {
    const { id } = Route.useParams();
    return <CellarDetailScreen id={id} />;
  },
});
