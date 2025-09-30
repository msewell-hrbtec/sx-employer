<script setup lang="ts">
import { Form } from '@primevue/forms'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Button from 'primevue/button'
import Select from 'primevue/select'
import {onMounted, ref} from 'vue'

import Footer from "@/components/shared/Footer.vue"
import hrbCore from "@/hrbCore"
import router from "@/router"
import {useRoute} from "vue-router";

const route = useRoute()
const showChallenge = ref(false)
const challenge = ref("")
const employers = ref([])
const employer = ref("")
const email = ref("")
const showViewSelection = ref(false)

// Simple resolver for basic validation
const resolver = (values: any) => {
  const errors: any = {};

  if (!email.value) {
    errors.email = [{ message: 'Email is required' }];
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    errors.email = [{ message: 'Email is invalid' }];
  }

  if (showChallenge.value && !values.values.challenge) {
    errors.challenge = [{ message: 'Challenge is required' }];
  }

  if (!employer.value) {
    errors.employer = [{ message: 'Employer is required' }];
  }

  return { errors };
};

const sendChallenge = () => {
  challenge.value = "";
  hrbCore.sendChallenge(email.value).then((response) => {
    if (!response.success) {
      const errorMessage = response?.message || 'Login failed. Please try again.';
      hrbCore.putMessage(errorMessage, true);
      return;
    } else if (response.message) {
      hrbCore.putMessage(response.message, false);
    }
    showChallenge.value = true;
    if (response.payload.employers) {
      employers.value = response.payload.employers;
      showViewSelection.value = true;
    }
  }).catch((error) => {
    console.error('Login error:', error);
    hrbCore.putMessage('An error occurred during login. Please try again.', true);
  });
};

const handleSubmit = (event: any) => {
  if (event.valid) {
    if (!showChallenge.value) {
      sendChallenge();
      return;
    }
    hrbCore.login(email.value, challenge.value, employer.value).then((response) => {
      if (!response.success) {
        const errorMessage = response?.message || 'Login failed. Please try again.';
        hrbCore.putMessage(errorMessage, true);
        return;
      } else if (response.message) {
        hrbCore.putMessage(response.message, false);
      }
      hrbCore.saveState(response.payload);
      router.push("/")
    }).catch((error) => {
      console.error('Login error:', error);
      hrbCore.putMessage('An error occurred during login. Please try again.', true);
    });
  }
};
onMounted(() => {
  getUrlQueryParams()
})

const getUrlQueryParams = async () => {
  await router.isReady()
  if (route.query.action === "register") {
    employer.value = hrbCore.getEmployer().id
    email.value = hrbCore.getUser().email
    showChallenge.value = true;
  }
}
</script>

<template>
  <Form v-slot="$form" :resolver="resolver" @submit="handleSubmit" class="flex flex-col gap-4 w-full">
    <div class="bg-surface-50 dark:bg-surface-950 px-6 py-20 md:px-12 lg:px-20">
      <div class="bg-surface-0 dark:bg-surface-900 p-8 md:p-12 shadow-sm rounded-2xl w-full max-w-xl mx-auto flex flex-col gap-8">
        <div class="flex flex-col items-center gap-4">
          <div class="flex items-center gap-4">
            <img :src="hrbCore.getDomain()?.image" :alt="hrbCore.getDomain()?.name" />
          </div>
          <div class="flex flex-col items-center gap-2 w-full">
            <div class="text-surface-900 dark:text-surface-0 text-2xl font-semibold leading-tight text-center w-full">{{hrbCore.getUser().email ? "Welcome Back" : "Activate Your Account" }}</div>
          </div>
        </div>
        <div class="flex flex-col gap-6 w-full">
          <div class="flex flex-col gap-2 w-full">
            <label for="email1" class="text-surface-900 dark:text-surface-0 font-medium leading-normal">Email Address</label>
            <InputText id="email1" v-model="email" name="email" type="email" placeholder="Email address" class="w-full px-3 py-2 shadow-sm rounded-lg" />
            <Message v-if="$form.email?.invalid" severity="error" size="small" variant="simple">{{ $form.email.error.message }}</Message>
          </div>
        </div>
        <div v-if="showViewSelection">
          <p class="text-surface-900 dark:text-surface-0 font-normal leading-normal p-3">This user is associated with one or many employers.  Please select the employer you would like to login as?</p>
          <div class="flex flex-col gap-2 w-full">
            <Select id="employer" name="employer" v-model="employer" :options="employers" optionLabel="name" optionValue="id" placeholder="Select One" class="w-full" />
            <Message v-if="$form.employer?.invalid" severity="error" size="small" variant="simple">{{ $form.employer.error.message }}</Message>
          </div>
        </div>
        <div class="flex flex-col w-full" v-if="showChallenge">
          <p class="dark:text-surface-0 font-normal leading-normal p-3 text-red-600">Please check your email for a challenge code.</p>
          <div class="flex flex-col gap-2 w-full pt-2">
            <label for="challenge" class="text-surface-900 dark:text-surface-0 font-medium leading-normal">Challenge Code</label>
            <div class="flex flex-wrap gap-4">
              <InputText id="challenge" v-model="challenge" name="challenge" type="text" placeholder="Enter challenge code" class="w-1/2 px-3 py-2 shadow-sm rounded-lg" />
              <Button type="button" @click="sendChallenge()" label="Resend" icon="pi pi-refresh" severity="secondary" class="py-2 rounded-lg flex justify-center items-center gap-2">
                <template #icon>
                  <i class="pi pi-refresh !text-base !leading-normal" />
                </template>
              </Button>
              <Message v-if="$form.challenge?.invalid" severity="error" size="small" variant="simple">{{ $form.challenge.error.message }}</Message>
            </div>
          </div>
        </div>
        <Button type="submit" label="Sign In" icon="pi pi-user" class="w-full py-2 rounded-lg flex justify-center items-center gap-2">
          <template #icon>
            <i class="pi pi-user !text-base !leading-normal" />
          </template>
        </Button>
      </div>
    </div>
  </Form>
  <Footer />
</template>
