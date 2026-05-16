import { Tabs } from "expo-router";
import { useTheme } from "../../lib/theme";
import { useAppMode } from "../../lib/appMode";
import { Home, BookOpen, Library, User } from "lucide-react-native";
import UnderConstruction from "./under-construction";
import GrammarScreen from "../grammar";
import ExamNavigator from "../goethe-exam/ExamNavigator";
import LearnScreen from "../learn";

export default function TabLayout() {
  const { theme: t } = useTheme();
  const { mode } = useAppMode();

  if (mode === "learn") return <LearnScreen />;
  if (mode === "grammar") return <GrammarScreen />;
  if (mode === "exam") return <ExamNavigator />;


  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.primary,
        tabBarInactiveTintColor: t.textMuted,
        tabBarStyle: {
          backgroundColor: t.tabBar,
          borderTopColor: t.tabBarBorder,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: "Study",
          tabBarIcon: ({ color, size }) => <BookOpen size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="words"
        options={{
          title: "Words",
          tabBarIcon: ({ color, size }) => <Library size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen name="under-construction" options={{ href: null }} />
    </Tabs>
  );
}
