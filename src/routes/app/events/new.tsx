import { createFileRoute } from "@tanstack/react-router";
import { EventFormScreen } from "@/screens/common/CommonScreens";

export const Route = createFileRoute("/app/events/new")({
  component: EventFormScreen,
});
