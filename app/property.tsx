import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { BersantaiButton } from "../components/BersantaiButton";
import { SectionHeading } from "../components/SectionHeading";
import { colors } from "../constants/theme";

export default function PropertyScreen() {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}><Text style={styles.brand}>BERSANTAI</Text><Text style={styles.kicker}>PRIVATE RESORT • BALI</Text></View>
      <View style={styles.hero}><Text style={styles.title}>The Bersantai Villa</Text><Text style={styles.description}>A private tropical retreat for slow mornings, long afternoons, and memorable evenings together.</Text></View>
      <View style={styles.section}>
        <SectionHeading eyebrow="The villa" title="Designed for unhurried stays." />
        <Text style={styles.body}>The property details shown here are intentionally easy to replace with the real villa information. During the next build stage, this screen will be driven by the property database rather than hard-coded content.</Text>
        <View style={styles.grid}>{["Private accommodation", "Tropical garden", "Pool", "Fully equipped kitchen", "Wi-Fi", "On-site support"].map((item) => <View key={item} style={styles.item}><Text style={styles.dot}>✦</Text><Text style={styles.itemText}>{item}</Text></View>)}</View>
        <BersantaiButton label="CHECK AVAILABILITY" onPress={() => router.push("/booking")} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream }, content: { paddingBottom: 60 },
  header: { padding: 26, backgroundColor: colors.teal, gap: 5 }, brand: { color: colors.white, fontSize: 18, fontWeight: "800", letterSpacing: 3 }, kicker: { color: colors.goldLight, fontSize: 10, letterSpacing: 1.8, fontWeight: "700" },
  hero: { padding: 50, backgroundColor: colors.white, gap: 14 }, title: { color: colors.teal, fontSize: 42, fontWeight: "600" }, description: { color: colors.muted, fontSize: 16, lineHeight: 26, maxWidth: 720 },
  section: { padding: 28, gap: 26, maxWidth: 900, width: "100%", alignSelf: "center" }, body: { color: colors.muted, fontSize: 15, lineHeight: 25 }, grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  item: { flexDirection: "row", gap: 10, alignItems: "center", width: "47%", minWidth: 220, padding: 15, backgroundColor: colors.white, borderRadius: 12, borderWidth: 1, borderColor: colors.line }, dot: { color: colors.gold }, itemText: { color: colors.ink, fontSize: 14 },
});