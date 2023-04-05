<template>
  <q-page class="desktop-screen-medium q-pa-md">
    <div class="camera q-pa-md">
      <img
        class="full-width"
        src="https://www.mosflot.ru/images/vorobievy-gory/vorobievi-gori-01.jpg"
      />
    </div>
    <div class="text-center q-pa-md">
      <q-btn round color="grey-10" icon="eva-camera" />
      <div class="row justify-center q-ma-md">
        <q-input
          class="col col-sm-6"
          v-model="post.caption"
          label="Caption"
          dense />
      </div>
      <div class="row justify-center q-ma-md">
        <q-input
          class="col col-sm-6"
          v-model="post.location"
          label="Location"
          dense>
          <template v-slot:append>
            <q-btn round dense flat icon="eva-navigation-2-outline" />
          </template>
        </q-input>
      </div>

      <div class="row justify-center q-mt-lg">
        <q-btn unelevated rounded color="primary" label="Post Image" />
      </div>
    </div>
  </q-page>
</template>

<script>
import { uid } from 'quasar';

export default {
  name: "PageCamera",
  data() {
    return {
      post: {
        id: uid(),
        caption: '',
        location: '',
        photo: null,
        date: Date.now()
      }

    }
  }
};
</script>
<style lang="sass">
.camera
  border: 2px solid $grey-10
  border-radius: 10px
</style>
