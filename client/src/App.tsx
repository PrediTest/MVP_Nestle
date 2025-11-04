import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import SocialSentiment from "./pages/SocialSentiment";
import AdminMonitoring from "./pages/AdminMonitoring";
import SentimentAlerts from "./pages/SentimentAlerts";
import AlertsDashboard from "./pages/AlertsDashboard";
import ProductComparison from "./pages/ProductComparison";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/projects"} component={Projects} />
      <Route path={"/sentiment"} component={SocialSentiment} />
      <Route path={"/admin"} component={AdminMonitoring} />
      <Route path={"/alerts"} component={SentimentAlerts} />
      <Route path={"/alerts-dashboard"} component={AlertsDashboard} />
      <Route path={"/comparison"} component={ProductComparison} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

