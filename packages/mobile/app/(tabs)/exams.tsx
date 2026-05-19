import React from "react";
import { View } from "react-native";
import ExamNavigator from "../goethe-exam/ExamNavigator";

export default function ExamsScreen() {
  // ExamNavigator sets its own useShellTopBar internally
  return (
    <View style={{ flex: 1 }}>
      <ExamNavigator />
    </View>
  );
}
