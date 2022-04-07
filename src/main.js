import { createApp } from 'vue'
import './tailwind.css'

import Vue3ChartJs from "@j-t-mcc/vue3-chartjs";

import App from './App.vue'
import * as Vue from 'vue' // in Vue 3
import axios from 'axios'
import VueAxios from 'vue-axios'
const app = createApp(App);
import annotationPlugin from 'chartjs-plugin-annotation';
Vue3ChartJs.registerGlobalPlugins([annotationPlugin]);
app.component('Vue3ChartJs', Vue3ChartJs);
app.use(VueAxios, axios);
app.mount('#app')
