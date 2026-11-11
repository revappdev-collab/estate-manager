import { createFileRoute } from "@tanstack/react-router";
import { TaskCreateScreen } from "@/screens/tasks/TaskScreens";

export const Route = createFileRoute("/app/tasks/new")({
  component: TaskCreateScreen,
});
