<script setup lang="ts">

import {onMounted, ref} from "vue"
import hrbCore from "@/hrbCore.ts"
import {Form} from "@primevue/forms"
import Message from "primevue/message"
import InputText from "primevue/inputtext"
import PhoneNumberInput from "@/components/PhoneNumberInput.vue"
import Button from "primevue/button"
import {useRoute, useRouter} from "vue-router"
import Footer from "@/components/shared/Footer.vue"

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const user: any = ref({})
const employer: any = ref({})
const resolver = () => {
  const errors: any = {}
  if (!user.value.firstName) {
    errors.firstName = [{ message: 'First name is required' }]
  }
  if (!user.value.lastName) {
    errors.lastName = [{ message: 'Last name is required' }]
  }
  if (!user.value.email) {
    errors.email = [{ message: 'Email is required' }]
  } else if (!/\S+@\S+\.\S+/.test(user.value.email)) {
    errors.email = [{ message: 'Email is invalid' }]
  }
  if (!user.value.phone) {
    errors.phone = [{ message: 'Phone is required' }]
  }
  if (!user.value.title) {
    errors.title = [{ message: 'Title is required' }]
  }
  return { errors }
}

const handleSubmit = (event: any) => {
  if (event.valid) {
    loading.value = true
    user.value.did = hrbCore.getDomain().id
    user.value.eid = employer.value.id
    hrbCore.inviteEmployer(user.value).then((response) => {
      loading.value = false
      if (response.success) {
        hrbCore.putMessage('Registration successful', false)
        hrbCore.saveState(response.payload)
        router.push(`/${hrbCore.getDomain().route}/login?action=register`)
      } else {
        hrbCore.putMessage(response.message, true)
      }
    })
  }
}

onMounted(() => {
  getUrlQueryParams()
})

const getUrlQueryParams = async () => {
  await router.isReady()
  hrbCore.getEmployerById(route?.query?.eid?.toString()!!).then((response: any) => {
    if (response.success) {
      employer.value = response.payload
    }
  })
}
</script>

<template>
  <div class="bg-surface-50 py-20 md:px-12 lg:px-12" style="background-image: url('https://static.skillxchange.io/images/employer/Register_Background.png');background-size: cover;">
    <div class="bg-surface-0 p-8 md:p-12 rounded-2xl w-full mx-auto flex flex-col">
      <div class="flex flex-col items-center gap-4 mb-5">
        <div class="flex">
          <img :src="hrbCore.getDomain()?.image" :alt="hrbCore.getDomain()?.name" />
          <span class="text-6xl mx-3 mt-16">+</span>
          <img :src="employer?.thumbnail" v-if="employer?.thumbnail" />
          <span v-else class="mt-15">{{employer?.name}}</span>
        </div>
      </div>
      <div class="max-w-2xl mx-auto w-full">
        <div class="flex flex-col items-center gap-4 mb-5">
          <h3 class="text-3xl font-bold">Claim Your Account</h3>
        </div>
        <Form v-slot="$form" :resolver="resolver" @submit="handleSubmit">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <InputText id="first-name" type="text" v-model="user.firstName" name="firstName" placeholder="First Name"/>
              <Message v-if="$form.firstName?.invalid" severity="error" size="small" variant="simple">{{ $form.firstName.error.message }}</Message>
            </div>
            <div class="flex flex-col gap-2">
              <InputText id="last-name" type="text" v-model="user.lastName" name="lastName" placeholder="Last Name"/>
              <Message v-if="$form.lastName?.invalid" severity="error" size="small" variant="simple">{{ $form.lastName.error.message }}</Message>
            </div>
            <div class="flex flex-col gap-2">
              <InputText id="title" type="text" v-model="user.title" name="title" placeholder="Title"/>
              <Message v-if="$form.title?.invalid" severity="error" size="small" variant="simple">{{ $form.title.error.message }}</Message>
            </div>
            <div class="flex flex-col gap-2">
              <InputText id="email" type="text" v-model="user.email" name="email" placeholder="Email Address"/>
              <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{ $form.email.error.message }}</Message>
            </div>
            <div class="flex flex-col gap-2">
              <PhoneNumberInput id="phone" v-model="user.phone" name="phone" placeholder="Phone"/>
              <Message v-if="$form.phone?.invalid" severity="error" size="small" variant="simple">{{ $form.phone.error.message }}</Message>
            </div>
            <div class="flex flex-col gap-2">
              <Button :disabled="loading" type="submit" class="bg-purple-600 text-white px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center">
                <i class="fas" :class="loading ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                <span>Submit</span>
              </Button>
            </div>
          </div>
        </Form>
        <Footer class="mt-10"/>
      </div>
    </div>
  </div>
</template>