<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import VillaCard from '@/components/VillaCard.vue';
import { serviceService } from '@/services/serviceService';
import { villaService } from '@/services/villaService';

const officialLogo = '/icons/bersantai-logo.png';
const router = useRouter();

const fallbackVillas = [
  {
    name: 'The Canopy House', location: 'Ubud, Bali', detail: '2 guests · 1 bedroom', price: '$240',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85'
  },
  {
    name: 'Tide & Timber', location: 'Nusa Lembongan, Bali', detail: '4 guests · 2 bedrooms', price: '$310',
    image: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=1200&q=85'
  },
  {
    name: 'Sundown Sanctuary', location: 'Lombok, Indonesia', detail: '6 guests · 3 bedrooms', price: '$420',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=85'
  }
];
const villas = ref(fallbackVillas);
const villaTypes = ref([]);
const operatingMode = ref('airbnb');
const services = ref([
  { id: 'fallback-dining', title: 'Fine dining', description: 'Bali-inspired menus prepared with market-fresh ingredients and served wherever you feel most at home.', imageUrl: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=900&q=85' },
  { id: 'fallback-transfer', title: 'Airport transfers', description: 'A smooth private transfer from the airport, ready when you land and tailored to your villa arrival.', imageUrl: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=900&q=85' },
  { id: 'fallback-spa', title: 'Massage and spa', description: 'Slow down with restorative treatments, gentle rituals, and the calm of a Balinese spa at your door.', imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=85' }
]);
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
    price: `$${villa.nightlyPrice}`,
    image: villa.photos?.[0]?.url || villa.villaType?.defaultImageUrl || '/icons/Background.jpg',
    mediaType: villa.photos?.[0]?.mediaType || 'image',
    amenities: villa.amenities || [],
    id: villa.id,
    villaType: villa.villaType || null
  };
}

onMounted(async () => {
  try {
    const result = await villaService.listPublic();
    if (result.villas.length) villas.value = result.villas.map(toCard);
  } catch (_error) {
    // Keep the curated landing cards available when the API is offline.
  }

  try {
    operatingMode.value = (await villaService.getPublicConfig()).config.operatingMode;
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
    if (result.services.length) services.value = result.services;
  } catch (_error) {
    // Keep the curated services available when the API is offline.
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
  router.push({ name: 'booking', query: { villaId: villa.id, villaTypeId: villa.villaTypeId || villa.villaType?.id || '' } });
  return;
  Object.assign(bookingForm, { villaId: villa.id || '', villaTypeId: villa.villaTypeId || '', guestName: '', guestEmail: '', checkIn: '', checkOut: '', guests: Math.min(villa.capacity || 2, 2) });
  bookingComplete.value = false;
  bookingError.value = '';
  showBooking.value = true;
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
  { number: '01', title: 'Morning offerings', text: 'Wake to frangipani, a quiet cup of Bali coffee, and a day with nowhere else to be.' },
  { number: '02', title: 'The island, gently', text: 'Follow rice-field paths, find a hidden warung, or let the tide decide the afternoon.' },
  { number: '03', title: 'A stay with soul', text: 'Homes with a sense of place, hosted with the warmth and grace of the island.' }
];

const baliDestinations = [
  { name: 'Ubud', note: 'Rice fields & ritual', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=85' },
  { name: 'Canggu', note: 'Salt air & slow mornings', image: 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&w=900&q=85' },
  { name: 'Uluwatu', note: 'Clifftops & golden hour', image: 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&w=900&q=85' }
];

const baliFacilities = [
  { icon: '✦', title: 'Island welcome', text: 'A warm arrival, fresh flowers, and thoughtful details from the moment you reach us.' },
  { icon: '◌', title: 'Private pools', text: 'Your own quiet waterline for slow afternoons beneath the palms.' },
  { icon: '⌁', title: 'Local table', text: 'Bali-inspired breakfasts and simple, beautiful meals made close to home.' },
  { icon: '⌂', title: 'Easy transfers', text: 'A considered arrival from the airport, coast, or wherever the island finds you.' }
];

</script>

<template>
  <main class="landing-page">
    <div class="leaf-animation" aria-hidden="true"><span class="leaf-frond leaf-frond-left"></span><span class="leaf-frond leaf-frond-right"></span><span class="leaf-shadow leaf-shadow-top"></span><span class="floating-leaf floating-leaf-one"></span><span class="floating-leaf floating-leaf-two"></span><span class="floating-leaf floating-leaf-three"></span><span class="floating-leaf floating-leaf-four"></span><span class="palm-shadow palm-shadow-left"></span><span class="palm-shadow palm-shadow-right"></span></div>
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-media" role="img" aria-label="A tropical villa overlooking the sea"></div>
      <div class="hero-shade"></div>
      <div class="mountain-atmosphere" aria-hidden="true"><span class="mist-band mist-band-one"></span><span class="mist-band mist-band-two"></span><span class="cloud-bank cloud-bank-one"></span><span class="cloud-bank cloud-bank-two"></span></div>
      <header class="site-header">
        <RouterLink class="brand brand-light" to="/" aria-label="Bersantai home"><img class="brand-logo" :src="officialLogo" alt="Bersantai Bali Private Resort"></RouterLink>
        <nav class="desktop-nav" aria-label="Main navigation"><a href="#home">Home</a><a href="#villas">Villas</a><a href="#how-it-works">How It Works</a><a href="#about">About</a><RouterLink class="host-link" to="/host/login">Host</RouterLink></nav>
        <div class="header-actions"><RouterLink class="mobile-host-link" to="/host/login">Host</RouterLink><RouterLink class="header-cta" to="/register">Request a Stay <span aria-hidden="true">↗</span></RouterLink></div>
      </header>
      <div class="hero-content" id="home"><p class="eyebrow eyebrow-light">Bali, at your own pace</p><h1 id="hero-title">Find your<br><em>island rhythm.</em></h1><p class="hero-copy">Private villas, rice-field mornings, and the kind of quiet<br class="desktop-break"> that stays with you long after you leave.</p><button class="button button-sun hero-book-button" type="button" @click="openBooking()">Book your stay <span aria-hidden="true">↗</span></button></div>
      <a class="scroll-cue" href="#villas"><span>Scroll to explore</span><b aria-hidden="true">↓</b></a>
    </section>

    <section class="villa-section section-pad" id="villas" data-reveal><div class="section-heading"><div><p class="eyebrow">Handpicked in Bali</p><h2>Stays worth<br><em>staying for.</em></h2></div><a class="text-link desktop-only" href="#villas">View all villas <span aria-hidden="true">↗</span></a></div><div class="villa-grid"><VillaCard v-for="villa in villas" :key="villa.name" :villa="villa" @book="openBooking(villa)" /></div></section>

    <section class="services-section section-pad" id="services" data-reveal><div class="section-heading"><div><p class="eyebrow">Made for your stay</p><h2>Island services,<br><em>beautifully handled.</em></h2></div><p class="section-aside">Thoughtful extras, arranged<br>around your rhythm.</p></div><div class="service-grid"><article v-for="service in services" :key="service.id" class="service-card"><img v-if="service.imageUrl" :src="service.imageUrl" :alt="service.title" loading="lazy"><div><h3>{{ service.title }}</h3><p>{{ service.description }}</p><button class="service-book" type="button" @click="openBooking()">Add to your stay <span aria-hidden="true">↗</span></button></div></article></div></section>

    <section class="facilities section-pad" data-reveal><div class="section-heading"><div><p class="eyebrow">Everything in its place</p><h2>Little luxuries,<br><em>naturally.</em></h2></div><p class="section-aside">The details that make<br>a stay feel effortless.</p></div><div class="facility-grid"><article v-for="facility in baliFacilities" :key="facility.title" class="facility-item"><span>{{ facility.icon }}</span><h3>{{ facility.title }}</h3><p>{{ facility.text }}</p></article></div></section>

    <section class="experience" id="how-it-works" data-reveal><div class="experience-inner"><div class="experience-heading"><p class="eyebrow eyebrow-light">Why Bersantai</p><h2>Make space<br>for <em>what matters.</em></h2></div><div class="experience-list"><article v-for="experience in experiences" :key="experience.number" class="experience-item"><span>{{ experience.number }}</span><div><h3>{{ experience.title }}</h3><p>{{ experience.text }}</p></div></article></div></div></section>

    <section class="review-section" data-reveal><div class="review-mark">“</div><blockquote>There is a softness to Bersantai that is hard to leave. Every detail felt considered, and Bali felt closer than ever.</blockquote><p>— Aisha R. · Singapore</p></section>

    <section class="final-cta section-pad"><p class="eyebrow">Your next chapter</p><h2>There is a little<br><em>more out there.</em></h2><p>Let the days unfold somewhere beautiful.</p><RouterLink class="button button-dark" to="/register">Find your villa <span aria-hidden="true">↗</span></RouterLink></section>

    <footer class="site-footer"><div class="footer-main"><div class="footer-intro"><RouterLink class="footer-logo" to="/"><img :src="officialLogo" alt="Bersantai Bali Private Resort"></RouterLink><p>Bersantai is a collection of private Bali stays, made for slower days, warm welcomes, and a closer connection to the island.</p></div><div class="footer-contact"><h3>Find us</h3><p>Ubud, Canggu & Uluwatu<br>Bali, Indonesia</p><a href="mailto:hello@bersantai.com">hello@bersantai.com</a><a href="tel:+62361234567">+62 361 234 567</a></div><div class="footer-navigation"><h3>Navigate</h3><div><a href="#home">Home</a><a href="#villas">Villas</a><a href="#how-it-works">Experiences</a><a href="#about">About</a></div><div><a href="#villas">Book a stay</a><a href="/host/login">Host portal</a><a href="mailto:hello@bersantai.com">Contact</a></div></div></div><div class="footer-bottom"><div class="footer-social"><a href="#home" aria-label="Instagram">◎</a><a href="#home" aria-label="Facebook">f</a><a href="#home" aria-label="Pinterest">p</a></div><p class="copyright">© 2026 Bersantai · Stay. Breathe. Belong.</p><a class="back-to-top" href="#home" aria-label="Back to top">↑</a></div></footer>
    <div v-if="showBooking" class="booking-backdrop" @click.self="showBooking = false"><section class="booking-modal" aria-labelledby="booking-title"><button class="booking-close" type="button" aria-label="Close booking" @click="showBooking = false">×</button><template v-if="bookingComplete"><span class="booking-success-icon">✓</span><p class="eyebrow">Request received</p><h2 id="booking-title">Your Bali stay is<br><em>on its way.</em></h2><p class="booking-message">We have sent your request for {{ selectedBookingVilla?.name }} to our stay team. We will be in touch shortly to confirm the details.</p><button class="button button-dark" type="button" @click="showBooking = false">Done</button></template><template v-else><p class="eyebrow">Begin your stay</p><h2 id="booking-title">Book your<br><em>somewhere.</em></h2><form class="booking-form" @submit.prevent="submitBooking"><label>Villa<select v-model="bookingForm.villaId" required><option v-for="villa in villas" :key="villa.id || villa.name" :value="villa.id">{{ villa.name }} · {{ villa.location }}</option></select></label><div class="booking-columns"><label>Check-in<input v-model="bookingForm.checkIn" type="date" :min="today" required></label><label>Check-out<input v-model="bookingForm.checkOut" type="date" :min="bookingForm.checkIn || today" required></label></div><label>Guests<input v-model="bookingForm.guests" type="number" min="1" :max="selectedBookingVilla?.capacity || 10" required></label><label>Your name<input v-model="bookingForm.guestName" autocomplete="name" required></label><label>Email address<input v-model="bookingForm.guestEmail" type="email" autocomplete="email" required></label><p v-if="bookingError" class="booking-error" role="alert">{{ bookingError }}</p><button class="button button-dark booking-submit" type="submit" :disabled="bookingSaving">{{ bookingSaving ? 'Sending request...' : 'Request to book' }} <span aria-hidden="true">↗</span></button><small class="booking-note">No payment today. Your reservation is confirmed after our team reviews your request.</small></form></template></section></div>
  </main>
</template>
