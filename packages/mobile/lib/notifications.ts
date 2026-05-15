import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const CHANNEL_ID = "deutschforge-lessons";
const NOTIFICATION_IDENTIFIER = "hourly-lesson-reminder";

const LESSON_MESSAGES = [
  { title: "🇩🇪 Zeit zu lernen!", body: "Your German words are waiting. Keep your streak alive!" },
  { title: "📚 Deutsch Übung", body: "A quick review keeps the vocabulary fresh. Let's go!" },
  { title: "🔥 Streak in danger!", body: "Don't break your streak — do a quick German session now." },
  { title: "🎯 Daily goal check", body: "Have you done your German lesson today? Let's knock it out!" },
  { title: "🌟 Viel Spaß beim Lernen!", body: "Learning a little every day adds up. Time for German!" },
  { title: "🧠 Spaced Repetition", body: "Some words are due for review. Your brain is ready!" },
  { title: "⚡ Quick German session", body: "Just 5 minutes of German can make a huge difference!" },
];

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Lesson Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#58CC02",
      sound: "default",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleHourlyReminders(): Promise<void> {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return;

    // Cancel any existing scheduled reminders first
    await cancelHourlyReminders();

    // Schedule hourly repeating notification
    // We pick a random message each time by scheduling 8 notifications spread across the day
    // (expo doesn't support dynamic content in repeating triggers)
    const msg = LESSON_MESSAGES[Math.floor(Math.random() * LESSON_MESSAGES.length)];

    await Notifications.scheduleNotificationAsync({
      identifier: NOTIFICATION_IDENTIFIER,
      content: {
        title: msg.title,
        body: msg.body,
        sound: "default",
        badge: 1,
        data: { screen: "study" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3600, // 1 hour
        repeats: true,
      },
    });

    console.log("[Notifications] Hourly reminder scheduled");
  } catch (err) {
    console.warn("[Notifications] Failed to schedule:", err);
  }
}

export async function cancelHourlyReminders(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDENTIFIER);
  } catch {
    // Ignore if not found
  }
}

export async function getScheduledReminders() {
  return Notifications.getAllScheduledNotificationsAsync();
}

export function addNotificationResponseListener(
  handler: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(handler);
}
