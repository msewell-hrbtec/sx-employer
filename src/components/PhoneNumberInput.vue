<script setup lang="ts">

import InputText from "primevue/inputtext";

const props = defineProps({
  id: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
  },
  modelValue: {
    type: String,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  // eslint-disable-next-line vue/no-reserved-props
  class: {
    type: String,
  },
});
const emit = defineEmits(["update:modelValue"]);

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
  if (inputDiv) {
    if (isInvalid) {
      inputDiv.classList.add("p-invalid");
    } else {
      inputDiv.classList.remove("p-invalid");
    }
  }
}
function change(e: KeyboardEvent) {
  formatPhoneNumber((e.target as HTMLInputElement).value);
  emit("update:modelValue", (e.target as HTMLInputElement).value);
}
function loseFocus(e: FocusEvent) {
  (e.target as HTMLInputElement).value = formatPhoneNumber((e.target as HTMLInputElement).value);
}
</script>
<template>
  <InputText :id="props.id" :readonly="props.readonly" :name="props.name" class="flex w-full" type="tel" :placeholder="props.placeholder" v-model="props.modelValue" @blur="loseFocus" @keyup="change" />
</template>
