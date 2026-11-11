import { createFileRoute } from "@tanstack/react-router";
import { MoreScreen } from "@/screens/common/CommonScreens";

export const Route = createFileRoute("/app/more")({
  component: MoreScreen,
});
