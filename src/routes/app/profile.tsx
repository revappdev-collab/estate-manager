import { createFileRoute } from "@tanstack/react-router";
import { ProfileScreen } from "@/screens/common/CommonScreens";

export const Route = createFileRoute("/app/profile")({
  component: ProfileScreen,
});
