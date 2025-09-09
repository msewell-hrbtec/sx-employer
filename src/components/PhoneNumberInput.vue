<script setup lang="ts">

import InputText from "primevue/inputtext";

const props = defineProps({
  required: {
    type: Boolean,
    default: false
  },
  id: {
    type: String,
  },
  name: {
    type: String,
  },
  placeholder: {
    type: String,
  },
  modelValue: {
    type: String,
  },
  // eslint-disable-next-line vue/no-reserved-props
  class: {
    type: String,
  },
});
const emit = defineEmits(["update:modelValue", "change"]);

function formatPhoneNumber(num: any) {
  if (num === undefined || num === null) {
    markInvalid(true);
    return "";
  }
  const re = /(\d{0,3})(\d{0,3})(\d{0,4})/;

  let x = num.replace(/\D/g, "");

  markInvalid(x.length !== 10);

  x = x.match(re);

  return !x![2] ? x![1] : "(" + x![1] + ") " + x![2] + (x![3] ? "-" + x![3] : "");
}
function markInvalid(isInvalid: boolean) {
  const inputDiv = document.getElementById(props.id as string);
  if (props.required && inputDiv) {
    if (isInvalid) {
      inputDiv.classList.remove("is-valid");
      inputDiv.classList.add("is-invalid");
    } else {
      inputDiv.classList.remove("is-invalid");
      inputDiv.classList.add("is-valid");
    }
  }
}
function change(e: KeyboardEvent) {
  emit("update:modelValue", (e.target as HTMLInputElement).value);
  emit("change");
}
function loseFocus(e: FocusEvent) {
  (e.target as HTMLInputElement).value = formatPhoneNumber((e.target as HTMLInputElement).value);
}
</script>
<template>
  <InputText :id="props.id" class="flex w-full" type="tel" :placeholder="props.placeholder" :value="formatPhoneNumber(props.modelValue)" :required="props.required" @blur="loseFocus" @keyup="change" />
</template>
