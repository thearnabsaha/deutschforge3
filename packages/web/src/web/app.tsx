import { Route, Switch, Redirect } from "wouter";
import { Provider } from "./components/provider";
import { useAuth } from "./hooks/use-auth";
import { Hammer } from "lucide-react";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";
import Dashboard from "./pages/index";
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
import WordsPage from "./pages/words";
import StudyPage from "./pages/study";
import ProfilePage from "./pages/profile";
import GrammarPage from "./pages/grammar";
import LearnPage from "./pages/learn";
import ExamsPage from "./pages/exams";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Hammer size={36} className="text-indigo-600 mb-3" strokeWidth={2} />
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
        <Route path="/grammar">
          <AuthGuard><GrammarPage /></AuthGuard>
        </Route>
        <Route path="/learn">
          <AuthGuard><LearnPage /></AuthGuard>
        </Route>
        <Route path="/exams">
          <AuthGuard><ExamsPage /></AuthGuard>
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
