import { createFileRoute } from "@tanstack/react-router";
import { InventoryListScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/inventory/")({
  component: InventoryListScreen,
});
