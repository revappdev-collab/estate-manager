import { createFileRoute } from "@tanstack/react-router";
import { ManualScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/manual")({
  component: ManualScreen,
});
