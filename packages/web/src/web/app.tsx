import { Route, Switch, Redirect } from "wouter";
import { Provider } from "./components/provider";
import { useAuth } from "./hooks/use-auth";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";
import Dashboard from "./pages/index";
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
import WordsPage from "./pages/words";
import StudyPage from "./pages/study";
import ProfilePage from "./pages/profile";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-3">⚒️</div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

function GuestGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (user) return <Redirect to="/" />;

  return <>{children}</>;
}

function App() {
  return (
    <Provider>
      <Switch>
        <Route path="/login">
          <GuestGuard><LoginPage /></GuestGuard>
        </Route>
        <Route path="/signup">
          <GuestGuard><SignupPage /></GuestGuard>
        </Route>
        <Route path="/">
          <AuthGuard><Dashboard /></AuthGuard>
        </Route>
        <Route path="/words">
          <AuthGuard><WordsPage /></AuthGuard>
        </Route>
        <Route path="/study">
          <AuthGuard><StudyPage /></AuthGuard>
        </Route>
        <Route path="/profile">
          <AuthGuard><ProfilePage /></AuthGuard>
        </Route>
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
      {import.meta.env.DEV && <AgentFeedback />}
      {<RunableBadge />}
    </Provider>
  );
}

export default App;
