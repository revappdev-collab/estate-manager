import { createFileRoute } from "@tanstack/react-router";
import { ReportsScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/reports")({
  component: ReportsScreen,
});
