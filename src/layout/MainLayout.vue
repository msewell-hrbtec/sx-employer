<script setup lang="ts">
  import Header from '@/components/shared/Header.vue';
  import Footer from "@/components/shared/Footer.vue";
</script>

<template>
  <div class="h-dvh bg-primary-50 relative p-2 flex overflow-hidden flex-col">
    <main class="flex-1 max-w-[1280px] w-full mx-auto flex flex-col transition-all duration-300 h-full bg-background rounded-3xl shadow-stroke overflow-hidden">
      <Header />
      <div class="p-6 flex-1 overflow-auto">
        <router-view />
      </div>
      <Footer/>
    </main>
  </div>
</template>
