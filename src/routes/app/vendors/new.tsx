import { createFileRoute } from "@tanstack/react-router";
import { VendorFormScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/vendors/new")({
  component: VendorFormScreen,
});
