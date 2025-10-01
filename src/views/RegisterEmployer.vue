<script setup lang="ts">

import {ref} from "vue"
import hrbCore from "@/hrbCore.ts"
import {Form} from "@primevue/forms"
import Message from "primevue/message"
import InputText from "primevue/inputtext"
import PhoneNumberInput from "@/components/PhoneNumberInput.vue"
import Select from "primevue/select"
import router from "@/router"
import ResourceUpload from "@/components/ResourceUpload.vue"
import Footer from "@/components/shared/Footer.vue"

// const plans = ref([
//   "15 Day Trial", "Basic Plan", "Pro Plan", "Enterprise Plan"
// ])
const sizes = ref([
    "1 to 10 Employees",
    "11 to 100 Employees",
    "101 to 250 Employees",
    "251 to 1000 Employees",
    "More than 1,000 Employees"
])
const loading = ref(false)
const employer: any = ref({})
const resolver = () => {
  const errors: any = {}
  if (!employer.value.firstName) {
    errors.firstName = [{ message: 'First name is required' }]
  }
  if (!employer.value.lastName) {
    errors.lastName = [{ message: 'Last name is required' }]
  }
  if (!employer.value.email) {
    errors.email = [{ message: 'Email is required' }]
  } else if (!/\S+@\S+\.\S+/.test(employer.value.email)) {
    errors.email = [{ message: 'Email is invalid' }]
  }
  if (!employer.value.name) {
    errors.name = [{ message: 'Company is required' }]
  }
  if (!employer.value.url) {
    errors.url = [{ message: 'Url is required' }]
  }
  if (!employer.value.size) {
    errors.size = [{ message: 'Company size is required' }]
  }
  if (!employer.value.plan) {
    errors.plan = [{ message: 'Plan is required' }]
  }
  if (!employer.value.phone) {
    errors.phone = [{ message: 'Phone is required' }]
  }
  if (!employer.value.title) {
    errors.title = [{ message: 'Title is required' }]
  }
  if (!employer.value.company) {
    errors.company = [{ message: 'Company is required' }]
  }
  if (!employer.value.size) {
    errors.size = [{ message: 'Company size is required' }]
  }
  if (!employer.value.plan) {
    errors.plan = [{ message: 'Plan is required' }]
  }
  return { errors }
}

const handleSubmit = (event: any) => {
  if (event.valid) {
    loading.value = true
    employer.value.did = hrbCore.getDomain().id
    hrbCore.registerEmployer(employer.value).then((response: any) => {
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
</script>

<template>
  <div class="bg-surface-50 py-20 md:px-12 lg:px-12" style="background-image: url('https://static.skillxchange.io/images/employer/Register_Background.png');background-size: cover;">
    <div class="bg-surface-0 p-8 md:p-12 rounded-2xl w-full max-w-2xl mx-auto flex flex-col">
      <div class="flex flex-col items-center gap-4">
        <img :src="hrbCore.getDomain()?.image" :alt="hrbCore.getDomain()?.name" />
      </div>
      <div class="flex flex-col items-center gap-4 mb-6">
        <h3 class="text-3xl font-bold">Create My Account</h3>
      </div>
      <Form v-slot="$form" :resolver="resolver" @submit="handleSubmit">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <InputText id="first-name" type="text" v-model="employer.firstName" name="firstName" placeholder="First Name"/>
            <Message v-if="$form.firstName?.invalid" severity="error" size="small" variant="simple">{{ $form.firstName.error.message }}</Message>
          </div>
          <div class="flex flex-col gap-2">
            <InputText id="last-name" type="text" v-model="employer.lastName" name="lastName" placeholder="Last Name"/>
            <Message v-if="$form.lastName?.invalid" severity="error" size="small" variant="simple">{{ $form.lastName.error.message }}</Message>
          </div>
          <div class="flex flex-col gap-2">
            <InputText id="title" type="text" v-model="employer.title" name="title" placeholder="Title"/>
            <Message v-if="$form.title?.invalid" severity="error" size="small" variant="simple">{{ $form.title.error.message }}</Message>
          </div>
          <div class="flex flex-col gap-2">
            <InputText id="name" type="text" v-model="employer.name" name="name" placeholder="Company"/>
            <Message v-if="$form.name?.invalid" severity="error" size="small" variant="simple">{{ $form.name.error.message }}</Message>
          </div>
          <div class="flex flex-col gap-2">
            <InputText id="email" type="text" v-model="employer.email" name="email" placeholder="Email Address"/>
            <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{ $form.email.error.message }}</Message>
          </div>
          <div class="flex flex-col gap-2">
            <InputText id="employer-url" type="url" v-model="employer.url" name="url" placeholder="https://www.yourcompany.com"/>
            <Message v-if="$form.url?.invalid" severity="error" size="small" variant="simple">{{ $form.url.error.message }}</Message>
          </div>
          <div class="flex flex-col gap-2">
            <PhoneNumberInput id="phone" v-model="employer.phone" name="phone" placeholder="Phone"/>
            <Message v-if="$form.phone?.invalid" severity="error" size="small" variant="simple">{{ $form.phone.error.message }}</Message>
          </div>
          <div class="flex flex-col gap-2">
            <Select v-model="employer.size" name="size" :options="sizes" placeholder="Company Size" class="w-full"/>
            <Message v-if="$form.size?.invalid" severity="error" size="small" variant="simple">{{ $form.size.error.message }}</Message>
          </div>
          <div class="flex flex-col gap-2">
            <label for="image">Upload Your Company Logo Here</label>
            <ResourceUpload v-model="employer.image" name="image" class="w-full" accept="" id="image" image-placeholder=""/>
          </div>
          <div class="flex flex-col gap-2">
<!--            <Select v-model="employer.plan" name="plan" :options="plans" placeholder="Choose a Plan" class="w-full"/>-->
<!--            <Message v-if="$form.plan?.invalid" severity="error" size="small" variant="simple">{{ $form.plan.error.message }}</Message>-->
            <Button :disabled="loading" type="submit" class="mt-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
              <i class="fas" :class="loading ? 'fa-spinner fa-spin' : 'fa-save'"></i>
              <span>Submit</span>
            </Button>
          </div>
        </div>
      </Form>
      <Footer class="mt-10"/>
    </div>
  </div>
</template>