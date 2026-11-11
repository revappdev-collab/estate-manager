import { createFileRoute } from "@tanstack/react-router";
import { RequestCreateScreen } from "@/screens/requests/RequestScreens";

export const Route = createFileRoute("/app/requests/new")({
  component: RequestCreateScreen,
});
