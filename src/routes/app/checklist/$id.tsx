import { createFileRoute } from "@tanstack/react-router";
import { ChecklistScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/checklist/$id")({
  component: function ChecklistRoute() {
    const { id } = Route.useParams();
    return <ChecklistScreen id={id} />;
  },
});
