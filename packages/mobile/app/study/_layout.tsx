import { Stack } from "expo-router";

export default function StudyLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="set" />
      <Stack.Screen name="flashcard" />
      <Stack.Screen name="article" />
      <Stack.Screen name="meaning" />
      <Stack.Screen name="speaking" />
      <Stack.Screen name="mixed" />
      <Stack.Screen name="exam" />
      <Stack.Screen name="exam-history" />
    </Stack>
  );
}
