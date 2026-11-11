import { createFileRoute } from "@tanstack/react-router";
import { AlertComposeScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/alerts/new")({
  component: AlertComposeScreen,
});
