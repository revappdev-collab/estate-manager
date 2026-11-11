import { createFileRoute } from "@tanstack/react-router";
import { ChatScreen } from "@/screens/common/CommonScreens";

export const Route = createFileRoute("/app/messages/$id")({
  component: function ChatRoute() {
    const { id } = Route.useParams();
    return <ChatScreen id={id} />;
  },
});
