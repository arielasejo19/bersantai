<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { storeToRefs } from 'pinia';
import VillaCard from '@/components/VillaCard.vue';
import DiningPavilionSection from '@/components/DiningPavilionSection.vue';
import { serviceService } from '@/services/serviceService';
import { packageService } from '@/services/packageService';
import { menuService } from '@/services/menuService';
import { villaService } from '@/services/villaService';
import { formatCurrency, resolveMediaUrl } from '@/services/currency';
import PhotoLightbox from '@/components/PhotoLightbox.vue';

const officialLogo = '/icons/bersantai-logo.png';
const router = useRouter();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const accountMenuOpen = ref(false);

const fallbackVillas = [
  { name: 'Java Mist House', location: 'Kintamani, Bali', detail: '2 guests · 1 bedroom', price: '₱12,000', image: '/images/villas/java-mountain.svg' },
  { name: 'Volcano View Villa', location: 'Munduk, Bali', detail: '4 guests · 2 bedrooms', price: '₱15,500', image: '/images/villas/sulawesi-mountain.svg' },
  { name: 'Highland Sanctuary', location: 'Bedugul, Bali', detail: '6 guests · 3 bedrooms', price: '₱21,000', image: '/images/villas/sumatra-mountain.svg' }
];
const villas = ref(fallbackVillas);
const diningVillas = ref([]);
const villaTypes = ref([]);
const operatingMode = ref('airbnb');
const publicSite = reactive({ location: 'Kintamani, Munduk & Bedugul', address: 'Bali, Indonesia', contactNumber: '+62 361 234 567', email: 'hello@bersantai.com', description: 'Bersantai is a collection of private Bali mountain stays, made for slower days, warm welcomes, and a closer connection to the highlands.' });
const services = ref([]);
const menuItems = ref([]);
const packages = ref([]);
const showBooking = ref(false);
const bookingSaving = ref(false);
const bookingComplete = ref(false);
const bookingError = ref('');
const bookingForm = reactive({ villaId: '', villaTypeId: '', guestName: '', guestEmail: '', checkIn: '', checkOut: '', guests: 2 });
const today = new Date().toISOString().slice(0, 10);
const selectedBookingVilla = computed(() => villas.value.find((villa) => String(villa.id) === String(bookingForm.villaId)) || villas.value[0]);

function toCard(villa) {
  return {
    name: villa.name,
    location: villa.location,
    detail: `${villa.capacity} guests · ${villa.bedroomCount} bedrooms`,
    price: formatCurrency(villa.nightlyPrice),
    image: villa.photos?.[0]?.url || villa.villaType?.defaultImageUrl || '',
    mediaType: villa.photos?.[0]?.mediaType || 'image',
    amenities: villa.amenities || [],
    id: villa.id,
    villaType: villa.villaType || null
  };
}

onMounted(async () => {
  try {
    const result = await villaService.listPublic();
    if (result.villas.length) {
      const cards = result.villas.map(toCard);
      diningVillas.value = cards.filter((villa) => villa.villaType?.slug === 'dining-pavilion' || villa.name.toLowerCase().includes('dining pavilion'));
      villas.value = cards.filter((villa) => !diningVillas.value.some((diningVilla) => diningVilla.id === villa.id));
    }
  } catch (_error) {
    // Keep the curated landing cards available when the API is offline.
  }

  try {
    const config = (await villaService.getPublicConfig()).config;
    operatingMode.value = config.operatingMode;
    Object.assign(publicSite, config.publicSite || {});
    const typeResult = await villaService.listPublicTypes();
    villaTypes.value = typeResult.villaTypes;
    if (operatingMode.value === 'hotel') {
      const grouped = villaTypes.value.map((type) => {
        const typeVillas = villas.value.filter((villa) => villa.villaType?.id === type.id);
        const representative = typeVillas[0];
        if (!representative) return null;
        return { ...representative, id: representative.id, name: type.name, location: 'Villa Type', detail: `${typeVillas.length} rooms · up to ${Math.max(...typeVillas.map((villa) => villa.capacity))} guests`, villaTypeId: type.id };
      }).filter(Boolean);
      if (grouped.length) villas.value = grouped;
    }
  } catch (_error) {
    // Keep Airbnb cards available when public configuration is offline.
  }

  try {
    const result = await serviceService.listPublic();
    services.value = result.services;
  } catch (_error) {
    services.value = [];
  }

  try {
    const result = await packageService.listPublic();
    packages.value = result.packages;
  } catch (_error) {
    packages.value = [];
  }

  try {
    const result = await menuService.listPublic();
    menuItems.value = result.menuItems;
  } catch (_error) {
    // Keep the hospitality services available when the public menu API is offline.
  }

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('[data-reveal]').forEach((element) => revealObserver.observe(element));
  } else {
    document.querySelectorAll('[data-reveal]').forEach((element) => element.classList.add('is-visible'));
  }
});

function openBooking(villa = villas.value[0]) {
  if (!villa) return;
  router.push({ name: 'booking', query: { villaId: villa.id, villaTypeId: villa.villaTypeId || villa.villaType?.id || '', bookingKind: villa.villaType?.dayTourOnly ? 'day_tour' : 'overnight' } });
  return;
  Object.assign(bookingForm, { villaId: villa.id || '', villaTypeId: villa.villaTypeId || '', guestName: '', guestEmail: '', checkIn: '', checkOut: '', guests: Math.min(villa.capacity || 2, 2) });
  bookingComplete.value = false;
  bookingError.value = '';
  showBooking.value = true;
}

async function logout() {
  accountMenuOpen.value = false;
  await authStore.logout();
  await router.push('/');
}

async function submitBooking() {
  bookingSaving.value = true;
  bookingError.value = '';
  try {
    const selectedVilla = villas.value.find((villa) => String(villa.id) === String(bookingForm.villaId));
    await villaService.book({ ...bookingForm, villaId: operatingMode.value === 'hotel' ? null : Number(bookingForm.villaId), villaTypeId: operatingMode.value === 'hotel' ? Number(selectedVilla?.villaTypeId || bookingForm.villaTypeId) : null, guests: Number(bookingForm.guests) });
    bookingComplete.value = true;
  } catch (error) {
    bookingError.value = error.message;
  } finally {
    bookingSaving.value = false;
  }
}

const experiences = [
  { number: '01', title: 'Mornings above the clouds', text: 'Wake to mist in the valley, a quiet cup of Bali coffee, and a day with nowhere else to be.' },
  { number: '02', title: 'The mountain, slowly', text: 'Follow forest paths, visit a hillside temple, or let the changing light decide the afternoon.' },
  { number: '03', title: 'A stay with altitude', text: 'Homes with a sense of place, hosted with the warmth and calm of Bali’s highlands.' }
];

const baliFacilities = [
  { icon: '✦', title: 'Highland welcome', text: 'A warm arrival, fresh flowers, and thoughtful details from the moment you reach the villa.' },
  { icon: '◌', title: 'Volcano views', text: 'Wake to layered ridgelines, cool air, and wide-open skies beyond your windows.' },
  { icon: '⌁', title: 'Local harvest', text: 'Bali-inspired breakfasts built around coffee, herbs, and produce grown nearby.' },
  { icon: '⌂', title: 'Easy ascents', text: 'A considered arrival from the airport through villages, forests, and mountain passes.' }
];

</script>

<template>
  <main class="landing-page">
    <div class="leaf-animation" aria-hidden="true"><span class="leaf-frond leaf-frond-left"></span><span class="leaf-frond leaf-frond-right"></span><span class="leaf-shadow leaf-shadow-top"></span><span class="floating-leaf floating-leaf-one"></span><span class="floating-leaf floating-leaf-two"></span><span class="floating-leaf floating-leaf-three"></span><span class="floating-leaf floating-leaf-four"></span></div>
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-media" role="img" aria-label="A mountain villa above the mist in Bali"></div>
      <div class="hero-shade"></div>
      <div class="mountain-atmosphere" aria-hidden="true"><span class="mist-band mist-band-one"></span><span class="mist-band mist-band-two"></span><span class="cloud-bank cloud-bank-one"></span><span class="cloud-bank cloud-bank-two"></span></div>
      <header class="site-header">
        <RouterLink class="brand brand-light" to="/" aria-label="Bersantai home"><img class="brand-logo" :src="officialLogo" alt="Bersantai Bali Mountain Villas"></RouterLink>
        <nav class="desktop-nav" aria-label="Main navigation"><a href="#home">Home</a><a href="#villas">Villas</a><a href="#services">Services</a><a href="#menu">Menu</a><a href="#packages">Packages</a><a href="#how-it-works">How It Works</a><RouterLink class="host-link" to="/host/login">Host</RouterLink></nav>
        <div class="header-actions"><RouterLink class="mobile-host-link" to="/host/login">Host</RouterLink><template v-if="user"><button class="header-avatar" type="button" aria-label="Open guest account menu" :aria-expanded="accountMenuOpen" @click="accountMenuOpen = !accountMenuOpen">{{ (user.displayName || user.email || 'G').charAt(0).toUpperCase() }}</button><div v-if="accountMenuOpen" class="header-account-menu"><span>Signed in as {{ user.displayName || user.email }}</span><RouterLink to="/profile/bookings" @click="accountMenuOpen = false">Manage booking</RouterLink><button type="button" @click="logout">Sign out</button></div></template><RouterLink v-else class="header-cta" to="/login">Guest login <span aria-hidden="true">↗</span></RouterLink></div>
      </header>
      <div class="hero-content" id="home"><p class="eyebrow eyebrow-light">Bali, above the ordinary</p><h1 id="hero-title">Find your<br><em>mountain calm.</em></h1><p class="hero-copy">Private villas, misty mornings, and the kind of quiet<br class="desktop-break"> that stays with you long after you leave.</p><button class="button button-sun hero-book-button" type="button" @click="openBooking()">Book your stay <span aria-hidden="true">↗</span></button></div>
      <a class="scroll-cue" href="#villas"><span>Scroll to explore</span><b aria-hidden="true">↓</b></a>
    </section>
    <DiningPavilionSection :dining-villas="diningVillas" @book="openBooking" />
    <section class="villa-section section-pad" id="villas" data-reveal><div class="section-heading"><div><p class="eyebrow">Mountain villas in Bali</p><h2>Stays worth<br><em>climbing for.</em></h2></div><a class="text-link desktop-only" href="#villas">View all villas <span aria-hidden="true">↗</span></a></div><div class="villa-grid"><VillaCard v-for="villa in villas" :key="villa.name" :villa="villa" @explore="router.push({ name: 'villa-detail', params: { villaId: villa.id } })" @book="openBooking(villa)" /></div></section>

    <section class="services-section section-pad" id="services" data-reveal><div class="section-heading"><div><p class="eyebrow">Made for your stay</p><h2>Mountain services,<br><em>beautifully handled.</em></h2></div><p class="section-aside">Thoughtful extras, arranged<br>around your rhythm.</p></div><div v-if="services.length" class="service-grid"><article v-for="service in services" :key="service.id" class="service-card"><PhotoLightbox v-if="service.imageUrl" :src="service.imageUrl" :alt="service.title" /><div><h3>{{ service.title }}</h3><p>{{ service.description }}</p><button class="service-book" type="button" @click="openBooking()">Add to your stay <span aria-hidden="true">↗</span></button></div></article></div><p v-else class="section-empty">Our stay services are being prepared.</p></section>

    <section class="menu-section section-pad" id="menu" data-reveal><div class="section-heading"><div><p class="eyebrow">From the Bersantai kitchen</p><h2>Good food,<br><em>slowly enjoyed.</em></h2></div><p class="section-aside">Local flavours and familiar<br>comforts for every stay.</p></div><div v-if="menuItems.length" class="menu-grid"><article v-for="item in menuItems" :key="item.id" class="menu-card"><PhotoLightbox v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" /><div class="menu-card-copy"><div class="menu-card-heading"><h3>{{ item.name }}</h3><strong>{{ formatCurrency(item.price) }}</strong></div><p>{{ item.description }}</p><small>{{ item.category?.name || 'Bersantai kitchen' }}<span v-if="item.mealOfDay"> · {{ item.mealOfDay.replace('-', ' ') }}</span></small></div></article></div><p v-else class="section-empty">The kitchen menu is being prepared.</p></section>

    <section v-if="packages.length" class="packages-section section-pad" id="packages" data-reveal><div class="section-heading"><div><p class="eyebrow">Stay and savour</p><h2>Packages made<br><em>for slowing down.</em></h2></div><p class="section-aside">One beautiful stay,<br>thoughtfully bundled.</p></div><div class="package-grid"><article v-for="item in packages" :key="item.id" class="package-card"><PhotoLightbox v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" /><div class="package-card-body"><p class="eyebrow">{{ item.discountPercent ? `${item.discountPercent}% saved` : 'Bersantai offer' }}</p><h3>{{ item.name }}</h3><p>{{ item.description }}</p><div class="package-includes"><span><strong>Villas</strong> {{ item.villas.map((villa) => villa.name).join(', ') }}</span><span><strong>Food</strong> {{ item.menuItems.map((food) => `${food.quantity > 1 ? `${food.quantity}× ` : ''}${food.name}`).join(', ') }}</span></div><div class="package-price"><span><strong>{{ formatCurrency(item.price) }}</strong><del v-if="item.originalPrice > item.price">{{ formatCurrency(item.originalPrice) }}</del></span><RouterLink class="service-book" to="/register">Book / inquire <span aria-hidden="true">↗</span></RouterLink></div></div></article></div></section>

    <section class="facilities section-pad" data-reveal><div class="section-heading"><div><p class="eyebrow">Everything in its place</p><h2>Little luxuries,<br><em>naturally.</em></h2></div><p class="section-aside">The details that make<br>a stay feel effortless.</p></div><div class="facility-grid"><article v-for="facility in baliFacilities" :key="facility.title" class="facility-item"><span>{{ facility.icon }}</span><h3>{{ facility.title }}</h3><p>{{ facility.text }}</p></article></div></section>

    <section class="experience" id="how-it-works" data-reveal><div class="experience-inner"><div class="experience-heading"><p class="eyebrow eyebrow-light">Why Bersantai</p><h2>Make space<br>for <em>what matters.</em></h2></div><div class="experience-list"><article v-for="experience in experiences" :key="experience.number" class="experience-item"><span>{{ experience.number }}</span><div><h3>{{ experience.title }}</h3><p>{{ experience.text }}</p></div></article></div></div></section>

    <section class="review-section" data-reveal><div class="review-mark">“</div><blockquote>There is a softness to Bersantai that is hard to leave. Every detail felt considered, and Bali felt closer than ever.</blockquote><p>— Aisha R. · Singapore</p></section>

    <section class="final-cta section-pad"><p class="eyebrow">Your next chapter</p><h2>There is a little<br><em>more out there.</em></h2><p>Let the days unfold somewhere beautiful.</p><RouterLink class="button button-dark" to="/register">Find your villa <span aria-hidden="true">↗</span></RouterLink></section>

    <footer class="site-footer"><div class="footer-main"><div class="footer-intro"><RouterLink class="footer-logo" to="/"><img :src="officialLogo" alt="Bersantai Bali Mountain Villas"></RouterLink><p>{{ publicSite.description }}</p></div><div class="footer-contact"><h3>Find us</h3><p>{{ publicSite.location }}<br>{{ publicSite.address }}</p><a :href="`mailto:${publicSite.email}`">{{ publicSite.email }}</a><a :href="`tel:${publicSite.contactNumber.replace(/[^+\d]/g, '')}`">{{ publicSite.contactNumber }}</a></div><div class="footer-navigation"><h3>Navigate</h3><div><a href="#home">Home</a><a href="#villas">Villas</a><a href="#services">Services</a><a href="#menu">Menu</a><a href="#how-it-works">Experiences</a></div><div><a href="#villas">Book a stay</a><a href="/host/login">Host portal</a><a :href="`mailto:${publicSite.email}`">Contact</a></div></div></div><div class="footer-bottom"><div class="footer-social"><a href="#home" aria-label="Instagram">◎</a><a href="#home" aria-label="Facebook">f</a><a href="#home" aria-label="Pinterest">p</a></div><p class="copyright">© 2026 Bersantai · Stay. Breathe. Belong.</p><a class="back-to-top" href="#home" aria-label="Back to top">↑</a></div></footer>
    <div v-if="showBooking" class="booking-backdrop" @click.self="showBooking = false"><section class="booking-modal" aria-labelledby="booking-title"><button class="booking-close" type="button" aria-label="Close booking" @click="showBooking = false">×</button><template v-if="bookingComplete"><span class="booking-success-icon">✓</span><p class="eyebrow">Request received</p><h2 id="booking-title">Your Bali stay is<br><em>on its way.</em></h2><p class="booking-message">We have sent your request for {{ selectedBookingVilla?.name }} to our stay team. We will be in touch shortly to confirm the details.</p><button class="button button-dark" type="button" @click="showBooking = false">Done</button></template><template v-else><p class="eyebrow">Begin your stay</p><h2 id="booking-title">Book your<br><em>somewhere.</em></h2><form class="booking-form" @submit.prevent="submitBooking"><label>Villa<select v-model="bookingForm.villaId" required><option v-for="villa in villas" :key="villa.id || villa.name" :value="villa.id">{{ villa.name }} · {{ villa.location }}</option></select></label><div class="booking-columns"><label>Check-in<input v-model="bookingForm.checkIn" type="date" :min="today" required></label><label>Check-out<input v-model="bookingForm.checkOut" type="date" :min="bookingForm.checkIn || today" required></label></div><label>Guests<input v-model="bookingForm.guests" type="number" min="1" :max="selectedBookingVilla?.capacity || 10" required></label><label>Your name<input v-model="bookingForm.guestName" autocomplete="name" required></label><label>Email address<input v-model="bookingForm.guestEmail" type="email" autocomplete="email" required></label><p v-if="bookingError" class="booking-error" role="alert">{{ bookingError }}</p><button class="button button-dark booking-submit" type="submit" :disabled="bookingSaving">{{ bookingSaving ? 'Sending request...' : 'Request to book' }} <span aria-hidden="true">↗</span></button><small class="booking-note">No payment today. Your reservation is confirmed after our team reviews your request.</small></form></template></section></div>
  </main>
</template>
