import { createFileRoute } from "@tanstack/react-router";
import { WorkOrderScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/maintenance/$id")({
  component: function WorkOrderRoute() {
    const { id } = Route.useParams();
    return <WorkOrderScreen id={id} />;
  },
});
