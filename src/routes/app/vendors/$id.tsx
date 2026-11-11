import { createFileRoute } from "@tanstack/react-router";
import { VendorDetailScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/vendors/$id")({
  component: function VendorDetailRoute() {
    const { id } = Route.useParams();
    return <VendorDetailScreen id={id} />;
  },
});
