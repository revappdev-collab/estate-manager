import { createFileRoute } from "@tanstack/react-router";
import { TeamListScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/team/")({
  component: TeamListScreen,
});
