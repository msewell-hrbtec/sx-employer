<script setup lang="ts">

import router from "@/router";
import hrbCore from "@/hrbCore.ts";
import {onMounted} from "vue";

onMounted(() => {
  // make sure we're allowed
  if (!hrbCore.getUser().superAdmin) {
    hrbCore.putMessage("You are not authorized to view Job Categories", true)
    router.push("/")
  }
})
</script>
<template>
  <div>Job Category</div>
</template>