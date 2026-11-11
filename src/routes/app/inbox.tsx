import { createFileRoute } from "@tanstack/react-router";
import { InboxScreen } from "@/screens/common/CommonScreens";

export const Route = createFileRoute("/app/inbox")({
  component: InboxScreen,
});
