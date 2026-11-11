import { createFileRoute } from "@tanstack/react-router";
import { WelcomeScreen } from "@/screens/auth/AuthScreens";

export const Route = createFileRoute("/welcome")({
  component: WelcomeScreen,
});
