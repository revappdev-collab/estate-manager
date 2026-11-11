import { createFileRoute } from "@tanstack/react-router";
import { SopDetailScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/sops/$id")({
  component: function SopDetailRoute() {
    const { id } = Route.useParams();
    return <SopDetailScreen id={id} />;
  },
});
