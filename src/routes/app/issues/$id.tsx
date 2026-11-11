import { createFileRoute } from "@tanstack/react-router";
import { IssueDetailScreen } from "@/screens/requests/RequestScreens";

export const Route = createFileRoute("/app/issues/$id")({
  component: function IssueDetailRoute() {
    const { id } = Route.useParams();
    return <IssueDetailScreen id={id} />;
  },
});
