import { router } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { BersantaiButton } from "../components/BersantaiButton";
import { FeatureCard } from "../components/FeatureCard";
import { SectionHeading } from "../components/SectionHeading";
import { colors } from "../constants/theme";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=2200&q=88";

function FloatingLeaf({ delay, duration, startLeft, size, rotate }: {
  delay: number;
  duration: number;
  startLeft: string;
  size: number;
  rotate: number;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: duration * 0.72,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [delay, duration, progress]);

  const translateX = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 24, -12] });
  const translateY = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -30, 8] });
  const rotateZ = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [`${rotate}deg`, `${rotate + 16}deg`, `${rotate - 8}deg`] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.floatingLeaf,
        { left: startLeft, width: size, height: size * 0.56, transform: [{ translateX }, { translateY }, { rotateZ }] },
      ]}
    />
  );
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const desktop = width >= 900;
  const [scrolled, setScrolled] = [false, () => undefined];

  return (
    <ScrollView
      style={styles.page}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <ImageBackground source={{ uri: HERO_IMAGE }} style={styles.heroImage} imageStyle={styles.heroImageStyle}>
          <View style={styles.heroShade} />
          <FloatingLeaf delay={0} duration={4300} startLeft="8%" size={62} rotate={-24} />
          <FloatingLeaf delay={700} duration={5200} startLeft="31%" size={44} rotate={18} />
          <FloatingLeaf delay={1300} duration={4700} startLeft="55%" size={54} rotate={-12} />
          <FloatingLeaf delay={300} duration={5600} startLeft="76%" size={70} rotate={28} />
          <FloatingLeaf delay={1100} duration={4900} startLeft="91%" size={40} rotate={-20} />

          <View style={[styles.nav, desktop && styles.navWide]}>
            <Pressable onPress={() => router.push("/")} style={styles.logoLockup}>
              <View style={styles.lotusMark}>
                <Text style={styles.lotusText}>⌁</Text>
              </View>
              <View>
                <Text style={styles.logoText}>BERSANTAI</Text>
                <Text style={styles.logoTagline}>STAY · BREATHE · BELONG</Text>
              </View>
            </Pressable>

            <View style={styles.navLinks}>
              <Pressable><Text style={styles.navLink}>HOME</Text></Pressable>
              <Pressable onPress={() => router.push("/property")}><Text style={styles.navLink}>VILLAS</Text></Pressable>
              <Pressable onPress={() => router.push("/booking")}><Text style={styles.navLink}>HOW IT WORKS</Text></Pressable>
              {desktop && <Pressable><Text style={styles.navLink}>ABOUT</Text></Pressable>}
            </View>

            <Pressable style={styles.requestButton} onPress={() => router.push("/booking")}>
              <Text style={styles.requestText}>REQUEST A STAY</Text>
              <Text style={styles.arrow}>→</Text>
            </Pressable>
          </View>

          <View style={[styles.heroContent, desktop && styles.heroContentDesktop]}>
            <Text style={styles.heroEyebrow}>MORE THAN A STAY</Text>
            <Text style={[styles.heroTitle, desktop && styles.heroTitleDesktop]}>A More{`\n`}Meaningful Escape</Text>
            <Text style={styles.heroDescription}>
              Discover private villas in nature’s most beautiful places.{`\n`}Slow down. Breathe deeper. Bersantai.
            </Text>
            <BersantaiButton label="EXPLORE VILLAS   →" onPress={() => router.push("/property")} />
          </View>

          <View style={[styles.highlights, desktop && styles.highlightsDesktop]}>
            <View style={styles.highlight}><Text style={styles.highlightIcon}>⌁</Text><Text style={styles.highlightTitle}>PREMIUM VILLAS</Text><Text style={styles.highlightText}>Curated stays in stunning locations</Text></View>
            <View style={styles.highlight}><Text style={styles.highlightIcon}>△</Text><Text style={styles.highlightTitle}>IN NATURE</Text><Text style={styles.highlightText}>Mountains, forests and breathtaking views</Text></View>
            <View style={styles.highlight}><Text style={styles.highlightIcon}>♡</Text><Text style={styles.highlightTitle}>PEACE OF MIND</Text><Text style={styles.highlightText}>A smoother, simpler booking experience</Text></View>
          </View>

          <View style={styles.scrollHint}><View style={styles.scrollLine} /><Text style={styles.scrollText}>SCROLL TO EXPLORE</Text><Text style={styles.scrollArrow}>⌄</Text></View>
        </ImageBackground>
      </View>

      <View style={styles.featuredSection}>
        <SectionHeading
          eyebrow="THE BERSANTAI COLLECTION"
          title="Places made for slowing down."
          description="Private tropical retreats surrounded by mountains, greenery and the quiet moments that make a stay memorable."
        />
        <View style={styles.featureRow}>
          <FeatureCard symbol="⌂" title="Private" description="A dedicated retreat where your group can settle in and make the space your own." />
          <FeatureCard symbol="◌" title="Tropical" description="Warm, natural surroundings and a calm atmosphere inspired by island living." />
          <FeatureCard symbol="✦" title="Personal" description="Thoughtful hospitality and an easy, considered stay from request to checkout." />
        </View>
      </View>

      <View style={[styles.cta, desktop && styles.ctaDesktop]}>
        <View style={styles.ctaCopy}>
          <Text style={styles.ctaEyebrow}>YOUR ESCAPE AWAITS</Text>
          <Text style={styles.ctaTitle}>Ready to bersantai?</Text>
          <Text style={styles.ctaText}>Check your dates and request a private stay in the mountains of Bali.</Text>
        </View>
        <BersantaiButton label="CHECK AVAILABILITY" onPress={() => router.push("/booking")} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerBrand}>BERSANTAI</Text>
        <Text style={styles.footerText}>PRIVATE VILLA RETREAT · BALI</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  content: { paddingBottom: 40 },
  hero: { minHeight: 820, width: "100%", backgroundColor: colors.teal },
  heroImage: { flex: 1, minHeight: 820, justifyContent: "space-between", overflow: "hidden" },
  heroImageStyle: { resizeMode: "cover" },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(1, 51, 50, 0.28)" },
  nav: { minHeight: 92, paddingHorizontal: 22, paddingTop: 18, paddingBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 18 },
  navWide: { paddingHorizontal: 64 },
  logoLockup: { flexDirection: "row", alignItems: "center", gap: 10, minWidth: 220 },
  lotusMark: { width: 38, height: 38, borderWidth: 1, borderColor: colors.goldLight, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  lotusText: { color: colors.goldLight, fontSize: 27, lineHeight: 29, transform: [{ rotate: "90deg" }] },
  logoText: { color: colors.white, fontSize: 20, fontWeight: "700", letterSpacing: 4.2 },
  logoTagline: { color: colors.goldLight, fontSize: 7.5, fontWeight: "700", letterSpacing: 2.1, marginTop: 3 },
  navLinks: { flexDirection: "row", alignItems: "center", gap: 25 },
  navLink: { color: colors.white, fontSize: 11, letterSpacing: 1.6, fontWeight: "700" },
  requestButton: { backgroundColor: colors.teal, borderRadius: 28, paddingHorizontal: 21, paddingVertical: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  requestText: { color: colors.white, fontSize: 11, fontWeight: "800", letterSpacing: 1.1 },
  arrow: { color: colors.goldLight, fontSize: 18, marginTop: -2 },
  heroContent: { paddingHorizontal: 28, paddingVertical: 54, maxWidth: 720, gap: 16 },
  heroContentDesktop: { paddingHorizontal: 9 + 64, paddingTop: 78, paddingBottom: 84 },
  heroEyebrow: { color: colors.goldLight, fontSize: 11, fontWeight: "800", letterSpacing: 3.4 },
  heroTitle: { color: colors.white, fontSize: 49, lineHeight: 55, fontWeight: "500", letterSpacing: -1.1 },
  heroTitleDesktop: { fontSize: 68, lineHeight: 72, maxWidth: 760 },
  heroDescription: { color: "#F3F5F0", fontSize: 16, lineHeight: 27, maxWidth: 620, marginBottom: 5 },
  highlights: { marginHorizontal: 22, marginBottom: 22, paddingVertical: 20, paddingHorizontal: 10, flexDirection: "row", flexWrap: "wrap", justifyContent: "center", backgroundColor: "rgba(1,51,50,0.34)", borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.22)" },
  highlightsDesktop: { marginHorizontal: 64, marginBottom: 18, paddingVertical: 17 },
  highlight: { width: "32%", minWidth: 150, paddingHorizontal: 18, alignItems: "center", justifyContent: "center", borderRightWidth: 1, borderColor: "rgba(255,255,255,0.22)" },
  highlightIcon: { color: colors.white, fontSize: 28, marginBottom: 7 },
  highlightTitle: { color: colors.white, fontSize: 10, fontWeight: "800", letterSpacing: 1.5, textAlign: "center" },
  highlightText: { color: "#DCE6E2", fontSize: 11, lineHeight: 17, textAlign: "center", marginTop: 5, maxWidth: 190 },
  scrollHint: { alignItems: "center", gap: 5, paddingBottom: 22 },
  scrollLine: { height: 26, width: 1, backgroundColor: "rgba(255,255,255,0.65)" },
  scrollText: { color: colors.white, fontSize: 8, letterSpacing: 2.6, fontWeight: "700" },
  scrollArrow: { color: colors.goldLight, fontSize: 17, lineHeight: 16 },
  floatingLeaf: { position: "absolute", top: "38%", backgroundColor: "rgba(238,244,211,0.9)", borderRadius: 100, zIndex: 3 },
  featuredSection: { paddingHorizontal: 24, paddingVertical: 74, gap: 36, maxWidth: 1200, width: "100%", alignSelf: "center" },
  featureRow: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  cta: { marginHorizontal: 20, marginTop: 8, padding: 30, borderRadius: 24, backgroundColor: colors.teal, gap: 24, alignItems: "flex-start" },
  ctaDesktop: { marginHorizontal: 64, paddingHorizontal: 54, paddingVertical: 42, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  ctaCopy: { maxWidth: 650, gap: 9 },
  ctaEyebrow: { color: colors.goldLight, fontSize: 10, fontWeight: "800", letterSpacing: 2.2 },
  ctaTitle: { color: colors.white, fontSize: 34, lineHeight: 40, fontWeight: "600" },
  ctaText: { color: "#D8E4E2", fontSize: 15, lineHeight: 24 },
  footer: { padding: 42, alignItems: "center", gap: 7 },
  footerBrand: { color: colors.teal, fontSize: 14, fontWeight: "800", letterSpacing: 3 },
  footerText: { color: colors.muted, fontSize: 10, letterSpacing: 1.8 },
});