import { createFileRoute } from "@tanstack/react-router";
import { CellarListScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/cellar/")({
  component: CellarListScreen,
});
