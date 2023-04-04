<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-white text-grey-10" bordered>
      <q-toolbar class="desktop-screen">
        <q-btn
          to="/camera"
          class="large-screen q-mr-sm"
          flat
          round
          dense
          size="18px"
          icon="eva-camera-outline"
        />
        <q-separator class="large-screen" spaced vertical />
        <q-toolbar-title class="text-grand-hotel text-bold">
          Instagram
        </q-toolbar-title>
        <q-btn
          to="/"
          class="large-screen"
          flat
          round
          dense
          size="18px"
          icon="eva-home-outline"
        />
      </q-toolbar>
    </q-header>

    <q-footer class="bg-white small-screen" bordered>
      <q-tabs
        class="text-grey-10"
        active-color="primary"
        indicator-color="transparent"
      >
        <q-route-tab to="/" icon="eva-home-outline" />
        <q-route-tab to="/camera" icon="eva-camera-outline" />
      </q-tabs>
    </q-footer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "MainPage",

  components: {},

  setup() {
    const leftDrawerOpen = ref(false);

    return {};
  },
});
</script>

<style lang="sass">
.q-toolbar
  @media (min-width: $breakpoint-sm-min)
    height: 77px
.q-toolbar__title
  @media (max-width: $breakpoint-xs-max)
   text-align: center
   font-size: 30px

.q-footer
  .q-tab__icon
   font-size: 30px
</style>
