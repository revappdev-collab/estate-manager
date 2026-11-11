import { createFileRoute } from "@tanstack/react-router";
import { RequestListScreen } from "@/screens/requests/RequestScreens";

export const Route = createFileRoute("/app/requests/")({
  component: RequestListScreen,
});
