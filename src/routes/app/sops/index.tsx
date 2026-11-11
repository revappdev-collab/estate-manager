import { createFileRoute } from "@tanstack/react-router";
import { SopListScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/sops/")({
  component: SopListScreen,
});
