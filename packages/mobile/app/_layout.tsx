import { useEffect, useRef } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { authClient } from "../lib/auth";
import { ActivityIndicator, View, AppState, type AppStateStatus } from "react-native";
import { ThemeProvider } from "../lib/theme";
import { AppModeProvider } from "../lib/appMode";
import { musicPlayer } from "../lib/music";
import {
  scheduleHourlyReminders,
  addNotificationResponseListener,
} from "../lib/notifications";
import { initLocalDb } from "../lib/localDb";
import { runSync } from "../lib/syncEngine";
import NetInfo from "@react-native-community/netinfo";

// Init DB immediately (sync, safe to call multiple times)
try {
  initLocalDb();
} catch (e) {
  console.warn("[db] init failed", e);
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
      networkMode: "offlineFirst",
    },
  },
});

musicPlayer.init().catch(() => {});
scheduleHourlyReminders();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const segments = useSegments();
  const router = useRouter();
  const lastSyncRef = useRef<number>(0);

  // Trigger sync when online + session available
  const maybeSync = (userId: string) => {
    const now = Date.now();
    if (now - lastSyncRef.current < 30_000) return; // throttle 30s
    lastSyncRef.current = now;
    runSync(userId).catch(() => {});
  };

  useEffect(() => {
    const sub = addNotificationResponseListener((response) => {
      const screen = response.notification.request.content.data?.screen;
      if (screen === "study") {
        router.push("/(tabs)/study");
      }
    });
    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    if (isPending) return;
    const inAuthGroup = segments[0] === "(auth)";
    if (!session && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (session && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, isPending, segments]);

  // Sync on network reconnect
  useEffect(() => {
    if (!session?.user?.id) return;
    const userId = session.user.id;

    const unsub = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable !== false) {
        maybeSync(userId);
      }
    });
    return () => unsub();
  }, [session?.user?.id]);

  // Sync on app foreground
  useEffect(() => {
    if (!session?.user?.id) return;
    const userId = session.user.id;

    const sub = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (nextState === "active") {
        maybeSync(userId);
      }
    });

    // Initial sync on mount
    maybeSync(userId);

    return () => sub.remove();
  }, [session?.user?.id]);

  if (isPending) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0D1B2A" }}>
        <ActivityIndicator size="large" color="#58CC02" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppModeProvider>
          <QueryClientProvider client={queryClient}>
            <AuthGate>
              <Slot />
            </AuthGate>
          </QueryClientProvider>
        </AppModeProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
