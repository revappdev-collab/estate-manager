import { createFileRoute } from "@tanstack/react-router";
import { DocumentListScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/documents/")({
  component: DocumentListScreen,
});
