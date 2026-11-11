import { createFileRoute } from "@tanstack/react-router";
import { RegisterScreen } from "@/screens/auth/AuthScreens";

export const Route = createFileRoute("/register")({
  component: RegisterScreen,
});
