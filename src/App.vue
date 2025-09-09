<script setup>
import { useToast } from 'primevue';
import { onMounted } from 'vue';
import hrbCore from '@/hrbCore';
import Toast from 'primevue/toast';

onMounted(() => {
  const toast = useToast();
  hrbCore.setToast(toast);
});
</script>

<template>
  <router-view />
  <Toast />
</template>