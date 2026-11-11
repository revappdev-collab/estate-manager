import { createFileRoute } from "@tanstack/react-router";
import { UsersScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/users")({
  component: UsersScreen,
});
