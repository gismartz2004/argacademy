import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, ProtectedRoute, useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import GalaxyMap from "@/pages/galaxy-map";
import PlayWorld from "@/pages/play";
import Login from "@/pages/login";
import AdminDashboard from "@/pages/admin-dashboard";
import { useLocation } from "wouter";

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) return null;

  if (!user || user.role !== "admin") {
    // Redirect non-admins to home if they try to access admin
    // Use useEffect or just return null with side-effect?
    // Better to use useEffect in real app, but for simplicity here:
    if (!loading) setLocation("/");
    return null;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/admin">
        <ProtectedAdminRoute>
          <AdminDashboard />
        </ProtectedAdminRoute>
      </Route>
      <Route path="/">
        <ProtectedRoute>
          <GalaxyMap />
        </ProtectedRoute>
      </Route>
      <Route path="/play">
        <ProtectedRoute>
          <PlayWorld />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
