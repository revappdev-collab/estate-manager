import { createFileRoute } from "@tanstack/react-router";
import { DocumentUploadScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/documents/new")({
  component: DocumentUploadScreen,
});
