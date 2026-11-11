import { createFileRoute } from "@tanstack/react-router";
import { SplashScreen } from "@/screens/auth/AuthScreens";

export const Route = createFileRoute("/")({
  component: SplashScreen,
});
