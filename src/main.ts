import router from '@/router'
import { definePreset } from '@primeuix/themes'
import { createApp } from 'vue'
import './style.css'
import hrbCore from "@/hrbCore"
import App from "@/App.vue"
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

const app = createApp(App)

app.use(router)

const MyPreset = definePreset(Aura, {
    semantic: {
        select: {
            borderRadius: '{border.radius.lg}',
            height: '2rem'
        },
        formField: {
            borderRadius: '{border.radius.md}'
        },
        primary: {
            50: '{blue.50}',
            100: '{blue.100}',
            200: '{blue.200}',
            300: '{blue.300}',
            400: '{blue.400}',
            500: '{blue.500}',
            600: '{blue.600}',
            700: '{blue.700}',
            800: '{blue.800}',
            900: '{blue.900}',
            950: '{blue.950}'
        }
    }
});
app.use(PrimeVue, {
    theme: {
        preset: MyPreset,
        options: {
            darkModeSelector: false
        }
    }
});
app.use(ToastService)
app.use(ConfirmationService)

app.mount('#app')

hrbCore.init()
