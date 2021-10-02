import Vue from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false;
Vue.prototype.$APP_VERSION = '0.2.0';
Vue.prototype.$BUILD_DATE = "<%=__BUILD_DATE__%>";

new Vue({
  vuetify,
  render: h => h(App),
}).$mount('#app');
