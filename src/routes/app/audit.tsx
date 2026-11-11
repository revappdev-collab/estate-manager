import { createFileRoute } from "@tanstack/react-router";
import { AuditScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/audit")({
  component: AuditScreen,
});
