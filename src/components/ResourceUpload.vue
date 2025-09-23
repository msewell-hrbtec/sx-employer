<script setup lang="ts">
import {onMounted, onUpdated, ref} from "vue"
import Button from "primevue/button"

const PREVIEW_IMAGE = "https://static.skillxchange.io/images/no-image.png"
const props = defineProps({
  accept: {
    type: String,
    required: true,
  },
  buttonLabel: {
    type: String,
    default: "Upload",
  },
  id: {
    type: String,
    required: true,
  },
  modelValue: {
    type:Object,
    default: null,
  },
  name: {
    type: String,
    required: true,
  }
})
let selectedFile = null
const previewImage: any = ref(PREVIEW_IMAGE)
const emit = defineEmits(["select", "update:modelValue"])
const onResourceSelectedFiles = (event: any) => {
  clearError()

  if (event.target.files && event.target.files.length > 0) {
    selectedFile = event.target.files[0]
    if (selectedFile.size > 2000000) {
      addError("File size must be under 1M in size!")
      return
    } else {
      emit("update:modelValue", selectedFile)
    }
  }

  const reader = new FileReader()
  reader.onload = () => {
    previewImage.value = reader.result
  };
  reader.readAsDataURL(event.target.files[0])
  showResourceDownload.value = false
  showResourceRemove.value = true
};
const showResourceDownload = ref(false)
const showResourceRemove = ref(false)
const onResourceChanged = () => {
  if (props.modelValue) {
    if (props.modelValue instanceof File) {
      showResourceRemove.value = true
      showResourceDownload.value = false
    } else {
      showResourceDownload.value = props.modelValue.indexOf("static.skillxchange.io") > -1
      showResourceRemove.value = true
      previewImage.value = props.modelValue
    }
  } else {
    previewImage.src = PREVIEW_IMAGE
  }

};
onUpdated(() => {
  onResourceChanged()
})
onMounted(() => {
  onResourceChanged()
})
const error = ref("")
const uploadResource = () => {
  document.getElementById(props.id)?.click()
};
const deleteResource = () => {
  clearError()
  previewImage.value = PREVIEW_IMAGE
  showResourceRemove.value = false
  emit("update:modelValue", null)
};
const addError = (msg: string) => {
  error.value = msg
};
const clearError = () => {
  error.value = ''
};
defineExpose({ addError: addError, clearError: clearError })
</script>
<template>
  <div class="flex" :class="error ? 'p-inputtext p-invalid' : ''">
    <img class="row-span-3" :src="previewImage" :id="'preview-' + props.id" alt="image" v-if="previewImage" style="width:200px"/>
    <ul class="p-2">
      <li class="py-1"><Button type="button" size="small" class="w-full" outlined @click="uploadResource" label="Upload" /></li>
      <li class="py-1"><Button type="button" size="small" class="w-full" outlined @click="deleteResource" label="Remove" severity="danger" v-if="showResourceRemove"/></li>
      <li class="py-1"><a :href="previewImage" class="w-full" download v-if="showResourceDownload"><Button type="button" size="small" outlined severity="help" label="Download"/></a></li>
    </ul>
  </div>
  <div class="block p-message-error p-message-simple" v-if="error" style="width: 100%;">{{ error }}</div>
  <input hidden :accept="props.accept" type="file" :id="props.id" @change="onResourceSelectedFiles" />

</template>