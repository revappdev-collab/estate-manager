import { createFileRoute } from "@tanstack/react-router";
import { PropertyListScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/properties/")({
  component: PropertyListScreen,
});
