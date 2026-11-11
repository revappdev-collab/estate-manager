import { createFileRoute } from "@tanstack/react-router";
import { SafetyScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/safety")({
  component: SafetyScreen,
});
