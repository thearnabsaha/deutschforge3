import React, { useCallback } from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { musicPlayer } from "./music";

/**
 * Drop-in replacement for TouchableOpacity that plays the click sound
 * before calling onPress.
 */
export const SoundButton = React.memo(function SoundButton({
  onPress,
  children,
  ...props
}: TouchableOpacityProps) {
  const handlePress = useCallback(
    (e: any) => {
      musicPlayer.playClick();
      onPress?.(e);
    },
    [onPress]
  );

  return (
    <TouchableOpacity {...props} onPress={handlePress}>
      {children}
    </TouchableOpacity>
  );
});
