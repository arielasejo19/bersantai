import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";

export function FeatureCard({ symbol, title, description }: { symbol: string; title: string; description: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.symbol}><Text style={styles.symbolText}>{symbol}</Text></View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 210, padding: 22, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  symbol: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.tealSoft, alignItems: "center", justifyContent: "center", marginBottom: 18 },
  symbolText: { color: colors.gold, fontSize: 20 },
  title: { color: colors.teal, fontSize: 18, fontWeight: "700", marginBottom: 8 },
  description: { color: colors.muted, fontSize: 14, lineHeight: 22 },
});