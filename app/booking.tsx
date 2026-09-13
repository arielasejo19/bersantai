import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { BersantaiButton } from "../components/BersantaiButton";
import { colors } from "../constants/theme";

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export default function BookingScreen() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    setError("");
    const guestCount = Number(guests);

    if (!isValidDate(checkIn) || !isValidDate(checkOut)) {
      setError("Please enter valid dates using YYYY-MM-DD.");
      return;
    }
    if (new Date(`${checkOut}T00:00:00`) <= new Date(`${checkIn}T00:00:00`)) {
      setError("Check-out must be after check-in.");
      return;
    }
    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 20) {
      setError("Guests must be between 1 and 20.");
      return;
    }
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Please complete your name, email, and phone number.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    router.push({
      pathname: "/booking-success",
      params: {
        checkIn,
        checkOut,
        guests: String(guestCount),
        name: name.trim(),
        email: email.trim(),
        specialRequest: specialRequest.trim(),
      },
    });
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.kicker}>BERSANTAI</Text>
        <Text style={styles.title}>Request your stay</Text>
        <Text style={styles.description}>Choose your dates, tell us about your stay, and send a request for the host to review.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Stay details</Text>
        <View style={styles.row}>
          <Field label="CHECK-IN" value={checkIn} onChangeText={setCheckIn} placeholder="YYYY-MM-DD" />
          <Field label="CHECK-OUT" value={checkOut} onChangeText={setCheckOut} placeholder="YYYY-MM-DD" />
        </View>
        <Field label="GUESTS" value={guests} onChangeText={setGuests} placeholder="2" keyboardType="number-pad" />

        <Text style={styles.sectionTitle}>Guest details</Text>
        <Field label="FULL NAME" value={name} onChangeText={setName} placeholder="Your name" />
        <Field label="EMAIL" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
        <Field label="PHONE" value={phone} onChangeText={setPhone} placeholder="+63" keyboardType="phone-pad" />
        <Field label="SPECIAL REQUEST" value={specialRequest} onChangeText={setSpecialRequest} placeholder="Anything we should know?" multiline />

        <View style={styles.note}>
          <Text style={styles.noteTitle}>How booking works</Text>
          <Text style={styles.noteText}>Your request starts as PENDING. The host reviews the dates and details before accepting or declining the stay.</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <BersantaiButton label="SUBMIT BOOKING REQUEST" onPress={submit} />
      </View>
    </ScrollView>
  );
}

function Field({ label, value, onChangeText, placeholder, multiline, keyboardType, autoCapitalize }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; multiline?: boolean; keyboardType?: "email-address" | "phone-pad" | "number-pad"; autoCapitalize?: "none" | "sentences" }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} multiline={multiline} keyboardType={keyboardType} autoCapitalize={autoCapitalize} style={[styles.input, multiline && styles.multiline]} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  content: { paddingBottom: 60 },
  header: { padding: 34, backgroundColor: colors.teal, gap: 10 },
  kicker: { color: colors.goldLight, fontSize: 11, letterSpacing: 2.2, fontWeight: "800" },
  title: { color: colors.white, fontSize: 38, fontWeight: "600" },
  description: { color: "#D8E4E2", fontSize: 15, lineHeight: 24, maxWidth: 720 },
  card: { margin: 20, padding: 24, backgroundColor: colors.white, borderRadius: 20, gap: 18, maxWidth: 820, width: "100%", alignSelf: "center", borderWidth: 1, borderColor: colors.line },
  sectionTitle: { color: colors.teal, fontSize: 20, fontWeight: "700", marginTop: 8 },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  field: { flex: 1, minWidth: 240, gap: 7 },
  label: { color: colors.tealLight, fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  input: { minHeight: 48, borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 14, color: colors.ink, fontSize: 15, backgroundColor: "#FCFCFA" },
  multiline: { minHeight: 100, paddingTop: 14, textAlignVertical: "top" },
  note: { padding: 16, borderRadius: 12, backgroundColor: colors.tealSoft, gap: 5 },
  noteTitle: { color: colors.teal, fontWeight: "800" },
  noteText: { color: colors.muted, lineHeight: 21, fontSize: 13 },
  error: { color: "#A94442", fontSize: 13, lineHeight: 19, marginTop: -4 },
});
