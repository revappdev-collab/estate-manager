import { createFileRoute } from "@tanstack/react-router";
import { RequestCreateScreen } from "@/screens/requests/RequestScreens";

export const Route = createFileRoute("/app/report-issue")({
  component: function ReportIssueRoute() {
    return <RequestCreateScreen staff />;
  },
});
