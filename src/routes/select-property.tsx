import { createFileRoute } from "@tanstack/react-router";
import { SelectPropertyScreen } from "@/screens/auth/AuthScreens";

export const Route = createFileRoute("/select-property")({
  component: SelectPropertyScreen,
});
