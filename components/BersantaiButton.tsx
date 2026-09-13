import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../constants/theme";

type Props = { label: string; onPress?: () => void; variant?: "primary" | "outline" };

export function BersantaiButton({ label, onPress, variant = "primary" }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.base, variant === "primary" ? styles.primary : styles.outline, pressed && styles.pressed]}
    >
      <Text style={[styles.text, variant === "outline" && styles.outlineText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 52, paddingHorizontal: 24, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  primary: { backgroundColor: colors.gold },
  outline: { borderWidth: 1, borderColor: colors.gold, backgroundColor: "transparent" },
  text: { color: colors.teal, fontSize: 14, fontWeight: "700", letterSpacing: 1.3 },
  outlineText: { color: colors.teal },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
});