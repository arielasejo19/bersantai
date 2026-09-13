import { router } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { BersantaiButton } from "../components/BersantaiButton";
import { colors } from "../constants/theme";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1781511816247-006884d259e1?auto=format&fit=crop&fm=jpg&q=82&w=2400";

function BreezeLeaf({ left, top, size, delay, duration, drift }: { left: string; top: string; size: number; delay: number; duration: number; drift: number }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(progress, { toValue: 0, duration, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [delay, duration, progress]);

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, drift] });
  const translateY = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -22, 8] });
  const rotate = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: ["-12deg", "18deg", "-6deg"] });
  const opacity = progress.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 0.9, 0.75, 0] });

  return (
    <Animated.View style={[styles.leaf, { left, top, width: size, height: size * 0.55, opacity, transform: [{ translateX }, { translateY }, { rotate }] }]}>
      <View style={styles.leafVein} />
    </Animated.View>
  );
}

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const desktop = width >= 900;
  const heroHeight = desktop ? Math.max(720, Math.min(height, 900)) : Math.min(720, Math.max(600, height * 0.82));

  const leaves = useMemo(
    () => [
      ["5%", "20%", 70, 0, 7200, 90],
      ["27%", "13%", 42, 1500, 6100, -65],
      ["52%", "28%", 55, 700, 8300, 75],
      ["70%", "17%", 38, 2400, 6800, -55],
      ["86%", "35%", 62, 900, 7600, 80],
      ["18%", "55%", 48, 3000, 9000, 65],
      ["78%", "63%", 52, 1800, 8200, -70],
    ] as const,
    []
  );

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={[styles.hero, { height: heroHeight }]}>
        <ImageBackground source={{ uri: HERO_IMAGE }} resizeMode="cover" style={styles.heroImage}>
          <View style={styles.heroWarmth} />
          <View style={styles.heroShade} />

          {leaves.map(([left, top, size, delay, duration, drift], index) => (
            <BreezeLeaf key={index} left={left} top={top} size={size} delay={delay} duration={duration} drift={drift} />
          ))}

          <View style={[styles.nav, desktop && styles.navDesktop]}>
            <Pressable style={styles.logoLockup} onPress={() => router.push("/")}>
              <View style={styles.lotusMark}>
                <View style={[styles.petal, styles.petalTop]} />
                <View style={[styles.petal, styles.petalLeft]} />
                <View style={[styles.petal, styles.petalRight]} />
                <View style={[styles.petal, styles.petalBottom]} />
              </View>
              <View>
                <Text style={styles.logoText}>BERSANTAI</Text>
                <Text style={styles.logoTagline}>STAY · BREATHE · BELONG</Text>
              </View>
            </Pressable>

            {desktop ? (
              <View style={styles.navLinks}>
                <Pressable style={styles.activeNav}><Text style={styles.navLink}>Home</Text></Pressable>
                <Pressable onPress={() => router.push("/property")}><Text style={styles.navLink}>Villas</Text></Pressable>
                <Pressable><Text style={styles.navLink}>How It Works</Text></Pressable>
                <Pressable><Text style={styles.navLink}>About</Text></Pressable>
              </View>
            ) : null}

            <Pressable style={styles.requestButton} onPress={() => router.push("/booking")}>
              <Text style={styles.requestText}>Request a Stay</Text>
              <Text style={styles.requestArrow}>→</Text>
            </Pressable>
          </View>

          <View style={[styles.heroCopy, desktop && styles.heroCopyDesktop]}>
            <Text style={styles.eyebrow}>MORE THAN A STAY</Text>
            <Text style={[styles.heroTitle, desktop && styles.heroTitleDesktop]}>A More{`\n`}Meaningful Escape</Text>
            <Text style={styles.heroDescription}>Discover private villas in nature’s most beautiful places.{`\n`}Slow down. Breathe deeper. Bersantai.</Text>
            <BersantaiButton label="Explore Villas   →" onPress={() => router.push("/property")} />
          </View>

          <View style={[styles.highlights, desktop && styles.highlightsDesktop]}>
            <Highlight symbol="◒" title="Premium Villas" text="Curated stays in stunning locations" />
            <Highlight symbol="△" title="In Nature" text="Mountains, forests and breathtaking views" />
            <Highlight symbol="♡" title="Peace of Mind" text="A smoother, simpler booking experience" />
          </View>

          <View style={styles.scrollPrompt}>
            <Text style={styles.scrollArrow}>⌄</Text>
            <Text style={styles.scrollText}>SCROLL TO EXPLORE</Text>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.featuredSection}>
        <View>
          <Text style={styles.featuredEyebrow}>CURATED FOR YOU</Text>
          <Text style={styles.featuredTitle}>Featured Villas</Text>
          <Text style={styles.featuredText}>Private spaces surrounded by nature, designed for slower days.</Text>
        </View>
        <Pressable onPress={() => router.push("/property")}><Text style={styles.viewAll}>View All Villas  →</Text></Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerBrand}>BERSANTAI</Text>
        <Text style={styles.footerText}>STAY · BREATHE · BELONG</Text>
      </View>
    </ScrollView>
  );
}

function Highlight({ symbol, title, text }: { symbol: string; title: string; text: string }) {
  return (
    <View style={styles.highlight}>
      <Text style={styles.highlightSymbol}>{symbol}</Text>
      <Text style={styles.highlightTitle}>{title}</Text>
      <Text style={styles.highlightText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.cream },
  content: { paddingBottom: 0 },
  hero: { width: "100%", overflow: "hidden" },
  heroImage: { flex: 1, width: "100%", justifyContent: "space-between" },
  heroWarmth: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(240,190,105,0.10)" },
  heroShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(1,51,50,0.10)" },
  nav: { paddingHorizontal: 22, paddingTop: 24, flexDirection: "row", alignItems: "center", justifyContent: "space-between", zIndex: 5 },
  navDesktop: { paddingHorizontal: 7.5 * 64, paddingTop: 28 },
  logoLockup: { flexDirection: "row", alignItems: "center", gap: 10 },
  lotusMark: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  petal: { position: "absolute", width: 14, height: 21, borderWidth: 1.6, borderColor: colors.gold, borderRadius: 14, transformOrigin: "50% 100%" },
  petalTop: { transform: [{ translateY: -4 }] },
  petalLeft: { transform: [{ rotate: "-32deg" }, { translateX: -5 }, { translateY: 1 }] },
  petalRight: { transform: [{ rotate: "32deg" }, { translateX: 5 }, { translateY: 1 }] },
  petalBottom: { transform: [{ translateY: 5 }, { scaleX: 0.75 }] },
  logoText: { color: colors.teal, fontSize: 18, letterSpacing: 3.2, fontWeight: "500" },
  logoTagline: { color: colors.teal, fontSize: 7, letterSpacing: 1.8, marginTop: 2 },
  navLinks: { flexDirection: "row", alignItems: "center", gap: 42, marginLeft: 50 },
  navLink: { color: colors.teal, fontSize: 16, fontWeight: "500" },
  activeNav: { borderBottomWidth: 2, borderBottomColor: colors.gold, paddingBottom: 8 },
  requestButton: { backgroundColor: colors.teal, borderRadius: 30, paddingHorizontal: 26, paddingVertical: 15, flexDirection: "row", alignItems: "center", gap: 13 },
  requestText: { color: colors.white, fontSize: 15, fontWeight: "600" },
  requestArrow: { color: colors.goldLight, fontSize: 18 },
  heroCopy: { paddingHorizontal: 30, paddingBottom: 145, paddingTop: 45, maxWidth: 780, zIndex: 4 },
  heroCopyDesktop: { paddingLeft: 7.1 * 64, paddingBottom: 150, paddingTop: 30 },
  eyebrow: { color: colors.tealLight, fontSize: 12, fontWeight: "700", letterSpacing: 4, marginBottom: 18 },
  heroTitle: { color: colors.teal, fontSize: 47, lineHeight: 52, fontWeight: "500", letterSpacing: -1.5 },
  heroTitleDesktop: { fontSize: 67, lineHeight: 76, maxWidth: 720 },
  heroDescription: { color: colors.ink, fontSize: 17, lineHeight: 29, marginTop: 22, marginBottom: 26, maxWidth: 620 },
  highlights: { position: "absolute", left: 22, right: 22, bottom: 48, flexDirection: "row", justifyContent: "center", zIndex: 5 },
  highlightsDesktop: { left: "25%", right: "25%", bottom: 42 },
  highlight: { flex: 1, alignItems: "center", paddingHorizontal: 22, borderRightWidth: 1, borderRightColor: "rgba(255,255,255,0.35)" },
  highlightSymbol: { color: colors.white, fontSize: 28, marginBottom: 8 },
  highlightTitle: { color: colors.white, fontSize: 15, fontWeight: "600", marginBottom: 6 },
  highlightText: { color: "rgba(255,255,255,0.85)", fontSize: 12, lineHeight: 18, textAlign: "center", maxWidth: 170 },
  scrollPrompt: { position: "absolute", bottom: 12, alignSelf: "center", alignItems: "center", zIndex: 6 },
  scrollArrow: { color: colors.white, fontSize: 28, lineHeight: 22 },
  scrollText: { color: colors.white, fontSize: 9, letterSpacing: 2.5, marginTop: 5 },
  leaf: { position: "absolute", backgroundColor: "rgba(27,76,51,0.82)", borderRadius: 999, zIndex: 3, transformOrigin: "50% 50%" },
  leafVein: { position: "absolute", height: 1, backgroundColor: "rgba(220,235,205,0.55)", left: 7, right: 7, top: "50%" },
  featuredSection: { marginHorizontal: 5, marginTop: 0, paddingHorizontal: 70, paddingVertical: 65, backgroundColor: colors.white, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", gap: 30 },
  featuredEyebrow: { color: colors.gold, fontSize: 10, letterSpacing: 3, fontWeight: "700", marginBottom: 10 },
  featuredTitle: { color: colors.teal, fontSize: 46, fontWeight: "500", marginBottom: 10 },
  featuredText: { color: colors.muted, fontSize: 15, lineHeight: 23, maxWidth: 500 },
  viewAll: { color: colors.gold, fontSize: 14, fontWeight: "600" },
  footer: { paddingVertical: 38, alignItems: "center", backgroundColor: colors.cream },
  footerBrand: { color: colors.teal, fontSize: 14, letterSpacing: 3, fontWeight: "700" },
  footerText: { color: colors.muted, fontSize: 9, letterSpacing: 2, marginTop: 6 },
});
