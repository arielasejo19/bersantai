import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { BersantaiButton } from "../components/BersantaiButton";
import { colors } from "../constants/theme";

export default function BookingScreen() {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}><Text style={styles.kicker}>BERSANTAI</Text><Text style={styles.title}>Request your stay</Text><Text style={styles.description}>This is the first working booking-flow shell. The availability engine and Supabase persistence are the next implementation stage.</Text></View>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Stay details</Text>
        <View style={styles.row}><Field label="CHECK-IN" placeholder="Select date" /><Field label="CHECK-OUT" placeholder="Select date" /></View>
        <Field label="GUESTS" placeholder="2 guests" />
        <Text style={styles.sectionTitle}>Guest details</Text>
        <Field label="FULL NAME" placeholder="Your name" /><Field label="EMAIL" placeholder="you@example.com" keyboardType="email-address" /><Field label="PHONE" placeholder="+63" keyboardType="phone-pad" /><Field label="SPECIAL REQUEST" placeholder="Anything we should know?" multiline />
        <View style={styles.note}><Text style={styles.noteTitle}>Booking request</Text><Text style={styles.noteText}>In Villa mode, submitting this form will create a pending request for the host to review.</Text></View>
        <BersantaiButton label="SUBMIT BOOKING REQUEST" onPress={() => router.push("/booking-success")} />
      </View>
    </ScrollView>
  );
}

function Field({ label, placeholder, multiline, keyboardType }: { label: string; placeholder: string; multiline?: boolean; keyboardType?: "email-address" | "phone-pad" }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput placeholder={placeholder} placeholderTextColor={colors.muted} multiline={multiline} keyboardType={keyboardType} style={[styles.input, multiline && styles.multiline]} /></View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream }, content: { paddingBottom: 60 }, header: { padding: 34, backgroundColor: colors.teal, gap: 10 }, kicker: { color: colors.goldLight, fontSize: 11, letterSpacing: 2.2, fontWeight: "800" }, title: { color: colors.white, fontSize: 38, fontWeight: "600" }, description: { color: "#D8E4E2", fontSize: 15, lineHeight: 24, maxWidth: 720 },
  card: { margin: 20, padding: 24, backgroundColor: colors.white, borderRadius: 20, gap: 18, maxWidth: 820, width: "100%", alignSelf: "center", borderWidth: 1, borderColor: colors.line }, sectionTitle: { color: colors.teal, fontSize: 20, fontWeight: "700", marginTop: 8 }, row: { flexDirection: "row", flexWrap: "wrap", gap: 14 }, field: { flex: 1, minWidth: 240, gap: 7 }, label: { color: colors.tealLight, fontSize: 10, fontWeight: "800", letterSpacing: 1.5 }, input: { minHeight: 48, borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 14, color: colors.ink, fontSize: 15, backgroundColor: "#FCFCFA" }, multiline: { minHeight: 100, paddingTop: 14, textAlignVertical: "top" }, note: { padding: 16, borderRadius: 12, backgroundColor: colors.tealSoft, gap: 5 }, noteTitle: { color: colors.teal, fontWeight: "800" }, noteText: { color: colors.muted, lineHeight: 21, fontSize: 13 },
});