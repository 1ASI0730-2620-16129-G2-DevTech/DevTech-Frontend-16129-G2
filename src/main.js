import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import WashTrackPreset from '@/shared/presentation/washtrack-preset.js'
import '@/shared/presentation/styles/washtrack-theme.css'
import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css'

import Tooltip from 'primevue/tooltip';
import {
    Button,
    Card,
    Checkbox,
    Column,
    ConfirmDialog,
    DataTable,
    Dialog,
    Drawer,
    FileUpload,
    FloatLabel,
    IconField,
    InputIcon,
    InputNumber,
    InputText,
    Menu,
    Rating,
    Row,
    Select,
    SelectButton,
    Tag,
    Toast,
    Textarea,
    Toolbar,
    ConfirmationService,
    DialogService,
    ToastService
} from "primevue";
import i18n from "@/i18n.js";
import pinia from "@/pinia.js";
import router from "@/router.js";

const primeUiLicenseKey = import.meta.env.VITE_PRIME_UI_LICENSE_KEY;
createApp(App)
    .use(i18n)
    .use(PrimeVue, {
        ripple: true,
        license: primeUiLicenseKey,
        theme: {
            preset: WashTrackPreset
        }
    })
    .use(ConfirmationService)
    .use(DialogService)
    .use(ToastService)
    .component('pv-button',         Button)
    .component('pv-card',           Card)
    .component('pv-column',         Column)
    .component('pv-confirm-dialog', ConfirmDialog)
    .component('pv-checkbox',       Checkbox)
    .component('pv-data-table',     DataTable)
    .component('pv-dialog',         Dialog)
    .component('pv-select',         Select)
    .component('pv-select-button',  SelectButton)
    .component('pv-file-upload',    FileUpload)
    .component('pv-float-label',    FloatLabel)
    .component('pv-icon-field',     IconField)
    .component('pv-input-icon',     InputIcon)
    .component('pv-input-text',     InputText)
    .component('pv-input-number',   InputNumber)
    .component('pv-menu',           Menu)
    .component('pv-rating',         Rating)
    .component('pv-row',            Row)
    .component('pv-drawer',         Drawer)
    .component('pv-tag',            Tag)
    .component('pv-textarea',       Textarea)
    .component('pv-toolbar',        Toolbar)
    .component('pv-toast',          Toast)
    .directive('tooltip',           Tooltip)
    .use(pinia)
    .use(router)
    .mount('#app')
