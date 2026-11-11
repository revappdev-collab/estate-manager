import { createFileRoute } from "@tanstack/react-router";
import { MessageListScreen } from "@/screens/common/CommonScreens";

export const Route = createFileRoute("/app/messages/")({
  component: MessageListScreen,
});
