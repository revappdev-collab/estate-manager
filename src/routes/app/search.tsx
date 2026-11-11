import { createFileRoute } from "@tanstack/react-router";
import { SearchScreen } from "@/screens/common/CommonScreens";

export const Route = createFileRoute("/app/search")({
  component: SearchScreen,
});
