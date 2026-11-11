import { createFileRoute } from "@tanstack/react-router";
import { DocumentDetailScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/documents/$id")({
  component: function DocumentDetailRoute() {
    const { id } = Route.useParams();
    return <DocumentDetailScreen id={id} />;
  },
});
