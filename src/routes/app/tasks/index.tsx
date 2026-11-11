import { createFileRoute } from "@tanstack/react-router";
import { TaskListScreen } from "@/screens/tasks/TaskScreens";

export const Route = createFileRoute("/app/tasks/")({
  component: TaskListScreen,
});
