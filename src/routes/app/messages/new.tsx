import { createFileRoute } from "@tanstack/react-router";
import { NewMessageScreen } from "@/screens/common/CommonScreens";

export const Route = createFileRoute("/app/messages/new")({
  component: NewMessageScreen,
});
