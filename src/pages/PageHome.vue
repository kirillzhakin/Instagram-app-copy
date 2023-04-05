<template>
  <q-page class="desktop-screen q-pa-md">
    <q-card class="my-card" flat bordered>
      <q-item>
        <q-item-section avatar>
          <q-avatar>
            <img src="./../assets/my-avatar.jpg" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label class="text-bold">kirill_zhakin</q-item-label>
          <q-item-label caption> Moscow, Russia </q-item-label>
        </q-item-section>
      </q-item>

      <q-separator />

      <q-img
        class="rounded-borders"
        src="../assets/vorobievi-gori-01.jpg"
      />

      <q-card-section>
        <div>Sparrow Hills</div>
        <div class="text-caption text-gray">June 2023</div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "PageHome",
});
</script>

<style lang="sass">
.card-post
  .q-img
    min-height: 200px
</style>
