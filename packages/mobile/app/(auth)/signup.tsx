import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  Dimensions,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { authClient } from "../../lib/auth";
import { DeutschForgeMascot } from "../../components/DeutschForgeMascot";

const { width: W } = Dimensions.get("window");

// Fixed dark theme — auth screens always dark
const C = {
  bg:          "#0D1B2A",
  card:        "#112236",
  border:      "#1E3A5F",
  borderFocus: "#58CC02",
  text:        "#FFFFFF",
  textSub:     "#94A3B8",
  textMuted:   "#475569",
  primary:     "#58CC02",
  primaryDark: "#45A800",
  accent:      "#FFC800",
  inputBg:     "#0A1628",
};

export default function SignupScreen() {
  const [name,         setName]         = useState("");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [focusName,    setFocusName]    = useState(false);
  const [focusEmail,   setFocusEmail]   = useState(false);
  const [focusPass,    setFocusPass]    = useState(false);
  const router = useRouter();

  async function handleSignup() {
    if (!name || !email || !password) {
      Alert.alert("Missing fields", "Please fill in all fields");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Weak password", "Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await authClient.signUp.email({ name, email, password });
      if (res.error) {
        Alert.alert("Sign Up Failed", res.error.message ?? "Something went wrong");
      } else {
        router.replace("/(tabs)");
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ── Decorative dots ── */}
          <View style={styles.dot1} />
          <View style={styles.dot2} />

          {/* ── Fin + branding ── */}
          <View style={styles.hero}>
            <View style={styles.finRing}>
              <DeutschForgeMascot mood="celebrate" size={110} />
            </View>
            <Text style={styles.appName}>DeutschForge</Text>
            <View style={styles.pill}>
              <Text style={styles.pillText}>✨ Your journey starts here</Text>
            </View>
          </View>

          {/* ── Card ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Join DeutschForge</Text>
            <Text style={styles.cardSub}>Start your journey today</Text>

            {/* Name */}
            <View style={styles.fieldWrap}>
              <View style={[styles.inputRow, focusName && styles.inputRowFocus]}>
                <Ionicons name="person-outline" size={18} color={focusName ? C.primary : C.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Full name"
                  placeholderTextColor={C.textMuted}
                  autoCapitalize="words"
                  autoCorrect={false}
                  onFocus={() => setFocusName(true)}
                  onBlur={() => setFocusName(false)}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.fieldWrap}>
              <View style={[styles.inputRow, focusEmail && styles.inputRowFocus]}>
                <Ionicons name="mail-outline" size={18} color={focusEmail ? C.primary : C.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email address"
                  placeholderTextColor={C.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setFocusEmail(true)}
                  onBlur={() => setFocusEmail(false)}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldWrap}>
              <View style={[styles.inputRow, focusPass && styles.inputRowFocus]}>
                <Ionicons name="lock-closed-outline" size={18} color={focusPass ? C.primary : C.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password (min 8 chars)"
                  placeholderTextColor={C.textMuted}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusPass(true)}
                  onBlur={() => setFocusPass(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(v => !v)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={{ paddingRight: 4 }}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={C.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={[styles.btn, loading && { opacity: 0.7 }]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>Create Account  →</Text>
              }
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Login link */}
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity style={styles.outlineBtn} activeOpacity={0.8}>
                <Text style={styles.outlineBtnText}>Already have an account? Log In</Text>
              </TouchableOpacity>
            </Link>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 22, paddingBottom: 40, justifyContent: "center" },

  // decorative blobs
  dot1: {
    position: "absolute", top: -60, left: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: "#58CC02", opacity: 0.07,
  },
  dot2: {
    position: "absolute", bottom: 80, right: -80,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: "#FFC800", opacity: 0.05,
  },

  // hero
  hero: { alignItems: "center", marginBottom: 32, marginTop: 16 },
  finRing: {
    width: 140, height: 140,
    borderRadius: 70,
    backgroundColor: "#112236",
    borderWidth: 2,
    borderColor: "#1E3A5F",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#58CC02",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  appName: {
    fontSize: 30,
    fontWeight: "900",
    color: C.text,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  pill: {
    backgroundColor: "#112236",
    borderWidth: 1,
    borderColor: "#1E3A5F",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pillText: { color: C.textSub, fontSize: 13, fontWeight: "600" },

  // card
  card: {
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  cardTitle: { fontSize: 22, fontWeight: "800", color: C.text, marginBottom: 4 },
  cardSub: { fontSize: 14, color: C.textSub, marginBottom: 24 },

  // fields
  fieldWrap: { marginBottom: 14 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 4,
    minHeight: 52,
  },
  inputRowFocus: { borderColor: C.primary },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    color: C.text,
    paddingVertical: 10,
  },

  // button
  btn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 6,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  btnText: { fontSize: 16, fontWeight: "800", color: "#fff", letterSpacing: 0.3 },

  // divider
  divider: { flexDirection: "row", alignItems: "center", marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerText: { color: C.textMuted, fontSize: 13, marginHorizontal: 12 },

  // outline button
  outlineBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: C.border,
  },
  outlineBtnText: { fontSize: 15, fontWeight: "700", color: C.textSub },
});
