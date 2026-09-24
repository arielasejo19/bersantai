import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/styles.css';
import './assets/menu-package.css';
import { useAuthStore } from '@/stores/authStore';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
useAuthStore().restoreSession();
app.use(router);
app.mount('#app');
