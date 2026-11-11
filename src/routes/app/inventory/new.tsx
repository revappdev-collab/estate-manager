import { createFileRoute } from "@tanstack/react-router";
import { InventoryFormScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/inventory/new")({
  component: InventoryFormScreen,
});
