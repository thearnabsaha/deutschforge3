/**
 * Exam mode — Dashboard tab (Analytics overview)
 */
import React, { useEffect, useState, useCallback } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../lib/theme";
import { useAppMode } from "../../lib/appMode";
import { useShellTopBar } from "../../lib/AppShell";
import { LayoutDashboard } from "lucide-react-native";
import { loadResults } from "../../lib/examAnalytics";
import type { ExamResultsV2 } from "../../lib/examAnalytics";
import AnalyticsScreen from "../goethe-exam/AnalyticsScreen";

export default function ExamDashboardScreen() {
  const { theme: t } = useTheme();
  const { modeConfig } = useAppMode();
  const router = useRouter();
  const [results, setResults] = useState<ExamResultsV2>({});

  useShellTopBar({
    accent: modeConfig.color,
    left: (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <LayoutDashboard size={18} color={modeConfig.color} strokeWidth={2.5} />
      </View>
    ),
  });

  useEffect(() => {
    loadResults().then((r) => setResults(r));
  }, []);

  const handleBack = useCallback(() => {
    router.replace("/(tabs)/exams");
  }, [router]);

  const handleViewExamDetail = useCallback(
    (examId: string, level: any, section: any) => {
      router.push(`/goethe-exam/${level}/${section}/${examId}` as any);
    },
    [router]
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <AnalyticsScreen
        results={results}
        hideHeader
        onViewExamDetail={handleViewExamDetail}
      />
    </View>
  );
}
