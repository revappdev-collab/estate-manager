import { createFileRoute } from "@tanstack/react-router";
import { TaskDetailScreen } from "@/screens/tasks/TaskScreens";

export const Route = createFileRoute("/app/tasks/$id")({
  component: function TaskDetailRoute() {
    const { id } = Route.useParams();
    return <TaskDetailScreen id={id} />;
  },
});
