<script setup>
import { computed, ref, watch } from 'vue';
import { resolveMediaUrl } from '@/services/currency';

const props = defineProps({
  label: { type: String, default: 'Upload photo or video' },
  url: { type: String, default: '' },
  mediaType: { type: String, default: 'image' }
});
const emit = defineEmits(['select']);
const previewUrl = ref(props.url);
const previewType = ref(props.mediaType);
const accepts = 'image/*,video/mp4,video/webm,video/quicktime';
const previewSource = computed(() => resolveMediaUrl(previewUrl.value));

watch(() => props.url, (value) => { if (value) previewUrl.value = value; });
watch(() => props.mediaType, (value) => { if (value) previewType.value = value; });

function selectFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  previewUrl.value = URL.createObjectURL(file);
  previewType.value = file.type.startsWith('video/') ? 'video' : 'image';
  emit('select', file);
  event.target.value = '';
}
</script>

<template>
  <div class="media-upload-field">
    <div class="media-upload-heading"><span>{{ label }}</span><small>JPG, PNG, WEBP, MP4, WEBM · 50MB max</small></div>
    <label class="media-upload-dropzone"><input type="file" :accept="accepts" hidden @change="selectFile"><span>{{ previewUrl ? 'Replace media' : 'Choose photo or video' }}</span><strong>＋</strong></label>
    <div v-if="previewUrl" class="media-upload-preview"><video v-if="previewType === 'video'" :src="previewSource" controls muted></video><img v-else :src="previewSource" alt="Selected media preview"></div>
  </div>
</template>
