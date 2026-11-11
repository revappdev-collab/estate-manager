import fs from "fs";
import path from "path";

const root = "src/routes";
const routes = [
  ["index.tsx", "/", "SplashScreen", "@/screens/auth/AuthScreens"],
  ["onboarding.tsx", "/onboarding", "OnboardingScreen", "@/screens/auth/AuthScreens"],
  ["welcome.tsx", "/welcome", "WelcomeScreen", "@/screens/auth/AuthScreens"],
  ["sign-in.tsx", "/sign-in", "SignInScreen", "@/screens/auth/AuthScreens"],
  ["register.tsx", "/register", "RegisterScreen", "@/screens/auth/AuthScreens"],
  ["forgot.tsx", "/forgot", "ForgotScreen", "@/screens/auth/AuthScreens"],
  ["mfa.tsx", "/mfa", "MfaScreen", "@/screens/auth/AuthScreens"],
  ["select-property.tsx", "/select-property", "SelectPropertyScreen", "@/screens/auth/AuthScreens"],
  ["app/index.tsx", "/app/", "HomeScreen", "@/screens/home/HomeScreens"],
  ["app/tasks/index.tsx", "/app/tasks/", "TaskListScreen", "@/screens/tasks/TaskScreens"],
  ["app/tasks/new.tsx", "/app/tasks/new", "TaskCreateScreen", "@/screens/tasks/TaskScreens"],
  ["app/calendar.tsx", "/app/calendar", "CalendarScreen", "@/screens/common/CommonScreens"],
  ["app/inbox.tsx", "/app/inbox", "InboxScreen", "@/screens/common/CommonScreens"],
  ["app/more.tsx", "/app/more", "MoreScreen", "@/screens/common/CommonScreens"],
  ["app/requests/index.tsx", "/app/requests/", "RequestListScreen", "@/screens/requests/RequestScreens"],
  ["app/requests/new.tsx", "/app/requests/new", "RequestCreateScreen", "@/screens/requests/RequestScreens"],
  ["app/messages/index.tsx", "/app/messages/", "MessageListScreen", "@/screens/common/CommonScreens"],
  ["app/messages/new.tsx", "/app/messages/new", "NewMessageScreen", "@/screens/common/CommonScreens"],
  ["app/search.tsx", "/app/search", "SearchScreen", "@/screens/common/CommonScreens"],
  ["app/profile.tsx", "/app/profile", "ProfileScreen", "@/screens/common/CommonScreens"],
  ["app/properties/index.tsx", "/app/properties/", "PropertyListScreen", "@/screens/estate/EstateScreens"],
  ["app/approvals/index.tsx", "/app/approvals/", "ApprovalListScreen", "@/screens/estate/EstateScreens"],
  ["app/issues/index.tsx", "/app/issues/", "IssueInboxScreen", "@/screens/requests/RequestScreens"],
  ["app/maintenance/index.tsx", "/app/maintenance/", "MaintenanceListScreen", "@/screens/estate/EstateScreens"],
  ["app/inventory/index.tsx", "/app/inventory/", "InventoryListScreen", "@/screens/estate/EstateScreens"],
  ["app/inventory/new.tsx", "/app/inventory/new", "InventoryFormScreen", "@/screens/estate/EstateScreens"],
  ["app/cellar/index.tsx", "/app/cellar/", "CellarListScreen", "@/screens/estate/EstateScreens"],
  ["app/shopping/index.tsx", "/app/shopping/", "ShoppingListScreen", "@/screens/estate/EstateScreens"],
  ["app/documents/index.tsx", "/app/documents/", "DocumentListScreen", "@/screens/estate/EstateScreens"],
  ["app/documents/new.tsx", "/app/documents/new", "DocumentUploadScreen", "@/screens/estate/EstateScreens"],
  ["app/vendors/index.tsx", "/app/vendors/", "VendorListScreen", "@/screens/estate/EstateScreens"],
  ["app/vendors/new.tsx", "/app/vendors/new", "VendorFormScreen", "@/screens/estate/EstateScreens"],
  ["app/team/index.tsx", "/app/team/", "TeamListScreen", "@/screens/estate/EstateScreens"],
  ["app/sops/index.tsx", "/app/sops/", "SopListScreen", "@/screens/estate/EstateScreens"],
  ["app/manual.tsx", "/app/manual", "ManualScreen", "@/screens/estate/EstateScreens"],
  ["app/safety.tsx", "/app/safety", "SafetyScreen", "@/screens/estate/EstateScreens"],
  ["app/reports.tsx", "/app/reports", "ReportsScreen", "@/screens/estate/EstateScreens"],
  ["app/alerts/new.tsx", "/app/alerts/new", "AlertComposeScreen", "@/screens/estate/EstateScreens"],
  ["app/weather.tsx", "/app/weather", "WeatherScreen", "@/screens/estate/EstateScreens"],
  ["app/audit.tsx", "/app/audit", "AuditScreen", "@/screens/estate/EstateScreens"],
  ["app/users.tsx", "/app/users", "UsersScreen", "@/screens/estate/EstateScreens"],
  ["app/availability.tsx", "/app/availability", "AvailabilityScreen", "@/screens/estate/EstateScreens"],
  ["app/events/new.tsx", "/app/events/new", "EventFormScreen", "@/screens/common/CommonScreens"],
];

const params = [
  ["app/tasks/$id.tsx", "/app/tasks/$id", "TaskDetailScreen", "@/screens/tasks/TaskScreens"],
  ["app/requests/$id.tsx", "/app/requests/$id", "RequestDetailScreen", "@/screens/requests/RequestScreens"],
  ["app/messages/$id.tsx", "/app/messages/$id", "ChatScreen", "@/screens/common/CommonScreens"],
  ["app/properties/$id.tsx", "/app/properties/$id", "PropertyDetailScreen", "@/screens/estate/EstateScreens"],
  ["app/approvals/$id.tsx", "/app/approvals/$id", "ApprovalDetailScreen", "@/screens/estate/EstateScreens"],
  ["app/issues/$id.tsx", "/app/issues/$id", "IssueDetailScreen", "@/screens/requests/RequestScreens"],
  ["app/maintenance/$id.tsx", "/app/maintenance/$id", "WorkOrderScreen", "@/screens/estate/EstateScreens"],
  ["app/inventory/$id.tsx", "/app/inventory/$id", "InventoryDetailScreen", "@/screens/estate/EstateScreens"],
  ["app/adjust/$id.tsx", "/app/adjust/$id", "StockAdjustScreen", "@/screens/estate/EstateScreens"],
  ["app/cellar/$id.tsx", "/app/cellar/$id", "CellarDetailScreen", "@/screens/estate/EstateScreens"],
  ["app/shopping/$id.tsx", "/app/shopping/$id", "ShoppingDetailScreen", "@/screens/estate/EstateScreens"],
  ["app/documents/$id.tsx", "/app/documents/$id", "DocumentDetailScreen", "@/screens/estate/EstateScreens"],
  ["app/vendors/$id.tsx", "/app/vendors/$id", "VendorDetailScreen", "@/screens/estate/EstateScreens"],
  ["app/team/$id.tsx", "/app/team/$id", "TeamDetailScreen", "@/screens/estate/EstateScreens"],
  ["app/sops/$id.tsx", "/app/sops/$id", "SopDetailScreen", "@/screens/estate/EstateScreens"],
  ["app/checklist/$id.tsx", "/app/checklist/$id", "ChecklistScreen", "@/screens/estate/EstateScreens"],
  ["app/alerts/$id.tsx", "/app/alerts/$id", "AlertDetailScreen", "@/screens/estate/EstateScreens"],
  ["app/events/$id.tsx", "/app/events/$id", "EventDetailScreen", "@/screens/common/CommonScreens"],
];

function write(file, body) {
  const full = path.join(root, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, body);
}

for (const [file, route, comp, from] of routes) {
  write(
    file,
    `import { createFileRoute } from "@tanstack/react-router";\nimport { ${comp} } from "${from}";\n\nexport const Route = createFileRoute("${route}")({\n  component: ${comp},\n});\n`,
  );
}

write(
  "app/report-issue.tsx",
  `import { createFileRoute } from "@tanstack/react-router";\nimport { RequestCreateScreen } from "@/screens/requests/RequestScreens";\n\nexport const Route = createFileRoute("/app/report-issue")({\n  component: function ReportIssueRoute() {\n    return <RequestCreateScreen staff />;\n  },\n});\n`,
);

for (const [file, route, comp, from] of params) {
  const name = `${comp.replace("Screen", "")}Route`;
  write(
    file,
    `import { createFileRoute } from "@tanstack/react-router";\nimport { ${comp} } from "${from}";\n\nexport const Route = createFileRoute("${route}")({\n  component: function ${name}() {\n    const { id } = Route.useParams();\n    return <${comp} id={id} />;\n  },\n});\n`,
  );
}

console.log("routes written", routes.length + params.length + 1);
