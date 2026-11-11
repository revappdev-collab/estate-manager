import { createFileRoute } from "@tanstack/react-router";
import { ShoppingDetailScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/shopping/$id")({
  component: function ShoppingDetailRoute() {
    const { id } = Route.useParams();
    return <ShoppingDetailScreen id={id} />;
  },
});
