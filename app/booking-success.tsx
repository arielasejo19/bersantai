import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { BersantaiButton } from "../components/BersantaiButton";
import { colors } from "../constants/theme";

export default function BookingSuccessScreen() {
  return (
    <View style={styles.page}>
      <View style={styles.mark}><Text style={styles.markText}>✓</Text></View>
      <Text style={styles.eyebrow}>REQUEST RECEIVED</Text>
      <Text style={styles.title}>Your stay request is on its way.</Text>
      <Text style={styles.text}>In the production workflow, the host will review your request and the system will notify you when it is accepted or declined.</Text>
      <BersantaiButton label="BACK TO BERSANTAI" onPress={() => router.replace("/")} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream, alignItems: "center", justifyContent: "center", padding: 28, gap: 16 },
  mark: { width: 74, height: 74, borderRadius: 37, backgroundColor: colors.teal, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  markText: { color: colors.goldLight, fontSize: 34 }, eyebrow: { color: colors.gold, fontSize: 11, letterSpacing: 2.2, fontWeight: "800" },
  title: { color: colors.teal, fontSize: 36, lineHeight: 43, fontWeight: "600", textAlign: "center", maxWidth: 620 },
  text: { color: colors.muted, fontSize: 15, lineHeight: 25, textAlign: "center", maxWidth: 620, marginBottom: 10 },
});