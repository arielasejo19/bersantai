import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";

export function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10, maxWidth: 680 },
  eyebrow: { color: colors.gold, fontSize: 12, fontWeight: "800", letterSpacing: 2.2 },
  title: { color: colors.teal, fontSize: 36, lineHeight: 43, fontWeight: "600" },
  description: { color: colors.muted, fontSize: 16, lineHeight: 26 },
});