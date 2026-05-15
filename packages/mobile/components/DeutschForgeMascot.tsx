import React from "react";
import { Image, ImageStyle, StyleProp, TouchableWithoutFeedback } from "react-native";
import { useCallback, useRef, useState } from "react";

export type MascotMood =
  | "happy"
  | "sad"
  | "angry"
  | "thinking"
  | "neutral"
  | "celebrate"
  | "excited"
  | "sleepy";

const MOOD_IMAGES: Record<MascotMood, ReturnType<typeof require>> = {
  happy:     require("../assets/mascot/happy.png"),
  sad:       require("../assets/mascot/sad.png"),
  angry:     require("../assets/mascot/angry.png"),
  thinking:  require("../assets/mascot/thinking.png"),
  neutral:   require("../assets/mascot/neutral.png"),
  celebrate: require("../assets/mascot/celebrate.png"),
  excited:   require("../assets/mascot/celebrate.png"),
  sleepy:    require("../assets/mascot/neutral.png"),
};

const TAP_CYCLE: MascotMood[] = [
  "happy", "celebrate", "thinking", "angry", "sad", "neutral", "excited",
];

interface Props {
  mood?: MascotMood;
  size?: number;
  style?: StyleProp<ImageStyle>;
  controlled?: boolean;
}

export function DeutschForgeMascot({
  mood: moodProp = "neutral",
  size = 120,
  style,
  controlled = false,
}: Props) {
  const [mood, setMood] = useState<MascotMood>(moodProp);
  const tapIndexRef = useRef(TAP_CYCLE.indexOf(moodProp));

  React.useEffect(() => {
    setMood(moodProp);
  }, [moodProp]);

  const handleTap = useCallback(() => {
    if (controlled) return;
    tapIndexRef.current = (tapIndexRef.current + 1) % TAP_CYCLE.length;
    setMood(TAP_CYCLE[tapIndexRef.current]);
  }, [controlled]);

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <Image
        source={MOOD_IMAGES[mood]}
        style={[{ width: size, height: size, resizeMode: "contain" }, style as ImageStyle]}
      />
    </TouchableWithoutFeedback>
  );
}
