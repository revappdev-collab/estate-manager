import { createFileRoute } from "@tanstack/react-router";
import { MfaScreen } from "@/screens/auth/AuthScreens";

export const Route = createFileRoute("/mfa")({
  component: MfaScreen,
});
