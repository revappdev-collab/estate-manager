import { createFileRoute } from "@tanstack/react-router";
import { StockAdjustScreen } from "@/screens/estate/EstateScreens";

export const Route = createFileRoute("/app/adjust/$id")({
  component: function StockAdjustRoute() {
    const { id } = Route.useParams();
    return <StockAdjustScreen id={id} />;
  },
});
