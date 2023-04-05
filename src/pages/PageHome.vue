<template>
  <q-page class="desktop-screen q-pa-md">
    <div class="row q-col-gutter-lg">
      <div class="col-8">
        <q-card
          v-for="post in posts"
          :key="post.id"
          class="my-card q-mb-md"
          flat
          bordered
        >
          <q-item>
            <q-item-section avatar>
              <q-avatar>
                <img src="./../assets/my-avatar.jpg" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-bold">kirill_zhakin</q-item-label>
              <q-item-label caption> {{ post.location }} </q-item-label>
            </q-item-section>
          </q-item>

          <q-separator />

          <q-img :src="post.imageUrl" />

          <q-card-section>
            <div>{{ post.caption }}</div>
            <div class="text-caption text-gray">{{ viewDate(post.date) }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-4">

        <q-item class="fixed">
          <q-item-section avatar>
            <q-avatar size="48px">
              <img src="./../assets/my-avatar.jpg" />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-bold">kirill_zhakin</q-item-label>
            <q-item-label caption>Kirill Zhakin </q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </div>
  </q-page>
</template>

<script>
import { date } from "quasar";
const img =
  "https://www.mosflot.ru/images/vorobievy-gory/vorobievi-gori-01.jpg";

export default {
  name: "PageHome",
  data() {
    return {
      posts: [
        {
          id: 1,
          caption: "Sparrow Hills",
          date: new Date(2022, 6).getTime(),
          location: "Moscow, Russia",
          imageUrl: img,
        },
        {
          id: 2,
          caption: "Sparrow Hills",
          date: new Date(2022, 7).getTime(),
          location: "Moscow, Russia",
          imageUrl: img,
        },
        {
          id: 3,
          caption: "Sparrow Hills",
          date: new Date(2022, 8).getTime(),
          location: "Moscow, Russia",
          imageUrl: img,
        },
        {
          id: 4,
          caption: "Sparrow Hills",
          date: new Date(2022, 9).getTime(),
          location: "Moscow, Russia",
          imageUrl: img,
        },
      ],
    };
  },
  computed: {
    viewDate() {
      return (value) => date.formatDate(value, "DD MMM YYYY");
    },
  },
};
</script>

<style lang="sass">
.card-post
  .q-img
    min-height: 200px
</style>
