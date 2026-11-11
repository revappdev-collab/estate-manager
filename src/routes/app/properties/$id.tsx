import { createFileRoute } from "@tanstack/react-router";
import { PropertyDetailScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/properties/$id")({
  component: function PropertyDetailRoute() {
    const { id } = Route.useParams();
    return <PropertyDetailScreen id={id} />;
  },
});
