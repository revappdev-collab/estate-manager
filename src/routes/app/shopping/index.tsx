import { createFileRoute } from "@tanstack/react-router";
import { ShoppingListScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/shopping/")({
  component: ShoppingListScreen,
});
