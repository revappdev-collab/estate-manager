import { createFileRoute } from "@tanstack/react-router";
import { SignInScreen } from "@/screens/auth/AuthScreens";

export const Route = createFileRoute("/sign-in")({
  component: SignInScreen,
});
