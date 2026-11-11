import { createFileRoute } from "@tanstack/react-router";
import { AvailabilityScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/availability")({
  component: AvailabilityScreen,
});
