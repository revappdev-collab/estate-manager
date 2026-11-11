import { createFileRoute } from "@tanstack/react-router";
import { WeatherScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/weather")({
  component: WeatherScreen,
});
