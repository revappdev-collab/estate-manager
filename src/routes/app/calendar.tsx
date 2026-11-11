import { createFileRoute } from "@tanstack/react-router";
import { CalendarScreen } from "@/screens/common/CommonScreens";

export const Route = createFileRoute("/app/calendar")({
  component: CalendarScreen,
});
