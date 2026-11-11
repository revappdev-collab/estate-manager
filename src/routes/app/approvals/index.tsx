import { createFileRoute } from "@tanstack/react-router";
import { ApprovalListScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/approvals/")({
  component: ApprovalListScreen,
});
