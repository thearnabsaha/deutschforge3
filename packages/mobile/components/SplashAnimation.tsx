/**
 * SplashAnimation — one-shot animated splash screen featuring Fin.
 *
 * Sequence (total ~3.4s):
 *   0.0s  Fin slides in from below + fades in
 *   0.5s  Fin bounces on landing
 *   0.9s  Tail-chase: rapid left-right wiggle (looks at tail, chases it)
 *   2.0s  Excited bounce × 2 — "oh it's you!"
 *   2.6s  Gentle float down, settles, name fades in
 *   3.2s  onDone() fires
 */

import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width: W, height: H } = Dimensions.get("window");
const FIN_SIZE = Math.min(W * 0.62, 280);

interface Props {
  onDone: () => void;
}

export default function SplashAnimation({ onDone }: Props) {
  // ── Animated values ────────────────────────────────────────────────────
  const slideY    = useRef(new Animated.Value(H * 0.5)).current;  // starts below screen
  const fadeIn    = useRef(new Animated.Value(0)).current;
  const bounceY   = useRef(new Animated.Value(0)).current;
  const rotateVal = useRef(new Animated.Value(0)).current;
  const scaleVal  = useRef(new Animated.Value(0.6)).current;
  const nameFade  = useRef(new Animated.Value(0)).current;
  const nameSlide = useRef(new Animated.Value(18)).current;

  // shadow pulsing under Fin
  const shadowScale = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // ── Phase 1: slide in + scale up + fade in (0→500ms) ──────────────
    const phase1 = Animated.parallel([
      Animated.timing(slideY, {
        toValue: 0,
        duration: 480,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleVal, {
        toValue: 1,
        duration: 480,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
      Animated.timing(shadowScale, {
        toValue: 1,
        duration: 480,
        useNativeDriver: true,
      }),
    ]);

    // ── Phase 2: landing bounce squish (500→900ms) ─────────────────────
    const phase2 = Animated.sequence([
      Animated.timing(bounceY, {
        toValue: 12,
        duration: 120,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(bounceY, {
        toValue: 0,
        friction: 4,
        tension: 180,
        useNativeDriver: true,
      }),
    ]);

    // ── Phase 3: tail-chase wiggle (900→2000ms) ────────────────────────
    // Rapid back-and-forth rotate simulating spinning to chase tail
    const wiggle = (deg: number, dur: number) =>
      Animated.timing(rotateVal, {
        toValue: deg,
        duration: dur,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      });

    const phase3 = Animated.sequence([
      wiggle(20,  120), wiggle(-22, 120),
      wiggle(25,  110), wiggle(-28, 110),
      wiggle(30,  100), wiggle(-30, 100),
      wiggle(25,  110), wiggle(-20, 110),
      wiggle(15,  130), wiggle(-10, 130),
      wiggle(0,   160),
    ]);

    // ── Phase 4: excited "oh it's you!" bounce × 2 (2000→2600ms) ──────
    const phase4 = Animated.sequence([
      Animated.timing(bounceY, {
        toValue: -28,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(bounceY, {
        toValue: 0,
        duration: 200,
        easing: Easing.bounce,
        useNativeDriver: true,
      }),
      Animated.timing(bounceY, {
        toValue: -18,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(bounceY, {
        toValue: 0,
        duration: 200,
        easing: Easing.bounce,
        useNativeDriver: true,
      }),
    ]);

    // ── Phase 5: settle + name appears (2600→3300ms) ────────────────────
    const phase5 = Animated.parallel([
      Animated.timing(nameFade, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(nameSlide, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // Gentle float-settle
      Animated.sequence([
        Animated.timing(bounceY, {
          toValue: -6,
          duration: 300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bounceY, {
          toValue: 0,
          duration: 300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ]);

    // ── Run full sequence ──────────────────────────────────────────────
    Animated.sequence([
      phase1,
      phase2,
      phase3,
      phase4,
      phase5,
      Animated.delay(200),
    ]).start(() => {
      onDone();
    });
  }, []);

  const rotateDeg = rotateVal.interpolate({
    inputRange: [-360, 360],
    outputRange: ["-360deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      {/* Soft radial glow behind Fin */}
      <Animated.View
        style={[
          styles.glow,
          {
            opacity: fadeIn,
            transform: [{ scale: shadowScale }],
          },
        ]}
      />

      {/* Fin */}
      <Animated.View
        style={{
          transform: [
            { translateY: slideY },
            { translateY: bounceY },
            { rotate: rotateDeg },
            { scale: scaleVal },
          ],
          opacity: fadeIn,
        }}
      >
        <Image
          source={require("../assets/mascot/happy.png")}
          style={styles.fin}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Name */}
      <Animated.View
        style={{
          opacity: nameFade,
          transform: [{ translateY: nameSlide }],
          marginTop: 24,
          alignItems: "center",
        }}
      >
        <Text style={styles.appName}>DeutschForge</Text>
        <Text style={styles.tagline}>Forge your German vocabulary</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1B2A",
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: FIN_SIZE * 1.4,
    height: FIN_SIZE * 1.4,
    borderRadius: FIN_SIZE,
    backgroundColor: "#D4A017",
    opacity: 0.08,
  },
  fin: {
    width: FIN_SIZE,
    height: FIN_SIZE,
  },
  appName: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 13,
    color: "#8899AA",
    marginTop: 4,
    letterSpacing: 0.3,
  },
});
