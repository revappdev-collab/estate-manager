import { createFileRoute } from "@tanstack/react-router";
import { ApprovalDetailScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/approvals/$id")({
  component: function ApprovalDetailRoute() {
    const { id } = Route.useParams();
    return <ApprovalDetailScreen id={id} />;
  },
});
