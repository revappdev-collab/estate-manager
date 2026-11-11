import { createFileRoute } from "@tanstack/react-router";
import { InventoryDetailScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/inventory/$id")({
  component: function InventoryDetailRoute() {
    const { id } = Route.useParams();
    return <InventoryDetailScreen id={id} />;
  },
});
