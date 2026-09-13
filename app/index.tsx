import { router } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { BersantaiButton } from "../components/BersantaiButton";
import { FeatureCard } from "../components/FeatureCard";
import { SectionHeading } from "../components/SectionHeading";
import { colors } from "../constants/theme";

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={[styles.nav, desktop && styles.navWide]}>
        <View style={styles.brandMark}><Text style={styles.brandText}>BERSANTAI</Text></View>
        <View style={styles.navLinks}>
          <Pressable><Text style={styles.navLink}>HOME</Text></Pressable>
          <Pressable onPress={() => router.push("/property")}><Text style={styles.navLink}>THE VILLA</Text></Pressable>
          <Pressable onPress={() => router.push("/booking")}><Text style={styles.navLink}>BOOK</Text></Pressable>
        </View>
      </View>

      <View style={[styles.hero, desktop && styles.heroDesktop]}>
        <View style={[styles.heroVisual, desktop && styles.heroVisualDesktop]}>
          <View style={styles.heroLogoPlaceholder}>
            <Text style={styles.heroLogoText}>BERSANTAI</Text>
            <Text style={styles.heroLogoSub}>PRIVATE RESORT</Text>
          </View>
          <View style={styles.visualOverlay} />
          <View style={styles.heroBadge}><Text style={styles.badgeText}>PRIVATE RESORT • BALI</Text></View>
        </View>
        <View style={[styles.heroCopy, desktop && styles.heroCopyDesktop]}>
          <Text style={styles.eyebrow}>A PRIVATE ESCAPE</Text>
          <Text style={styles.heroTitle}>Slow down.{"\n"}Stay awhile.</Text>
          <Text style={styles.heroDescription}>Bersantai is a private resort experience designed for unhurried days, tropical surroundings, and time well spent together.</Text>
          <View style={styles.heroActions}>
            <BersantaiButton label="EXPLORE THE VILLA" onPress={() => router.push("/property")} />
            <BersantaiButton label="CHECK AVAILABILITY" variant="outline" onPress={() => router.push("/booking")} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeading eyebrow="The Bersantai experience" title="A place to relax, reconnect, and simply be." description="Everything about the stay should feel considered without feeling complicated." />
        <View style={styles.featureRow}>
          <FeatureCard symbol="⌂" title="Private" description="A dedicated retreat where your group can settle in and make the space your own." />
          <FeatureCard symbol="◌" title="Tropical" description="Warm, natural surroundings and a calm atmosphere inspired by island living." />
          <FeatureCard symbol="✦" title="Personal" description="A hospitality experience built around thoughtful service and an easy stay." />
        </View>
      </View>

      <View style={[styles.cta, desktop && styles.ctaDesktop]}>
        <View style={styles.ctaCopy}>
          <Text style={styles.eyebrow}>YOUR STAY</Text>
          <Text style={styles.ctaTitle}>Your private escape starts here.</Text>
          <Text style={styles.ctaText}>Check your dates and request a stay at Bersantai.</Text>
        </View>
        <BersantaiButton label="VIEW AVAILABILITY" onPress={() => router.push("/booking")} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerBrand}>BERSANTAI</Text>
        <Text style={styles.footerText}>PRIVATE RESORT • BALI</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream }, content: { paddingBottom: 40 },
  nav: { height: 84, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.white }, navWide: { paddingHorizontal: 64 },
  brandMark: { paddingVertical: 8 }, brandText: { color: colors.teal, fontSize: 16, fontWeight: "800", letterSpacing: 3 }, navLinks: { flexDirection: "row", gap: 22 }, navLink: { color: colors.tealLight, fontSize: 12, letterSpacing: 1.7, fontWeight: "700" },
  hero: { backgroundColor: colors.white }, heroDesktop: { flexDirection: "row", minHeight: 600 },
  heroVisual: { minHeight: 390, backgroundColor: colors.teal, alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }, heroVisualDesktop: { flex: 1, minHeight: 600 },
  heroLogoPlaceholder: { width: 280, height: 280, borderRadius: 140, borderWidth: 1, borderColor: colors.goldLight, alignItems: "center", justifyContent: "center" }, heroLogoText: { color: colors.white, fontSize: 27, fontWeight: "800", letterSpacing: 5 }, heroLogoSub: { color: colors.goldLight, fontSize: 9, letterSpacing: 3, marginTop: 8, fontWeight: "700" }, visualOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(1,51,50,0.18)" },
  heroBadge: { position: "absolute", left: 24, bottom: 24, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1, borderColor: colors.goldLight }, badgeText: { color: colors.white, fontSize: 10, letterSpacing: 1.8, fontWeight: "700" },
  heroCopy: { padding: 34, gap: 16, backgroundColor: colors.white }, heroCopyDesktop: { flex: 1, justifyContent: "center", paddingHorizontal: 64, paddingVertical: 56 }, eyebrow: { color: colors.gold, fontSize: 11, fontWeight: "800", letterSpacing: 2.2 }, heroTitle: { color: colors.teal, fontSize: 48, lineHeight: 54, fontWeight: "600" }, heroDescription: { color: colors.muted, fontSize: 16, lineHeight: 26, maxWidth: 540 }, heroActions: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 6 },
  section: { paddingHorizontal: 24, paddingVertical: 64, gap: 34, maxWidth: 1200, width: "100%", alignSelf: "center" }, featureRow: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  cta: { marginHorizontal: 20, marginTop: 12, padding: 30, borderRadius: 24, backgroundColor: colors.teal, gap: 24, alignItems: "flex-start" }, ctaDesktop: { marginHorizontal: 64, paddingHorizontal: 54, paddingVertical: 42, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, ctaCopy: { maxWidth: 650, gap: 9 }, ctaTitle: { color: colors.white, fontSize: 30, lineHeight: 37, fontWeight: "600" }, ctaText: { color: "#D8E4E2", fontSize: 15, lineHeight: 24 },
  footer: { padding: 42, alignItems: "center", gap: 7 }, footerBrand: { color: colors.teal, fontSize: 14, fontWeight: "800", letterSpacing: 3 }, footerText: { color: colors.muted, fontSize: 10, letterSpacing: 1.8 },
});