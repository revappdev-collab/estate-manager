import { createFileRoute } from "@tanstack/react-router";
import { VendorListScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/vendors/")({
  component: VendorListScreen,
});
