import { createFileRoute } from "@tanstack/react-router";
import { HomeScreen } from "@/screens/home/HomeScreens";

export const Route = createFileRoute("/app/")({
  component: HomeScreen,
});
