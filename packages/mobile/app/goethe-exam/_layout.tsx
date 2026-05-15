import { Stack } from "expo-router";

export default function GoetheExamLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[level]/index" />
      <Stack.Screen name="[level]/[section]/index" />
      <Stack.Screen name="[level]/[section]/[examId]" />
    </Stack>
  );
}
