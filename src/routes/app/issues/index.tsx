import { createFileRoute } from "@tanstack/react-router";
import { IssueInboxScreen } from "@/screens/requests/RequestScreens";

export const Route = createFileRoute("/app/issues/")({
  component: IssueInboxScreen,
});
