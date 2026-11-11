import { createFileRoute } from "@tanstack/react-router";
import { MaintenanceListScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/maintenance/")({
  component: MaintenanceListScreen,
});
