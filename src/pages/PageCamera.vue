<template>
  <q-page class="desktop-screen-medium q-pa-md">
    <div class="camera q-pa-md">
      <video
        v-show="!imgCaptured"
        ref="video"
        class="full-width"
        autoplay />
      <canvas
        v-show="imgCaptured"
        ref="canvas"
        class="full-width"
        height="240"
      />
    </div>
    <div class="text-center q-pa-md">
      <q-btn
        v-if="hasCamera"
        @click="getImage"
        round
        color="grey-10"
        icon="eva-camera"
      />

      <q-file
        v-else
        outlined
        @update:model-value ="getImageFile"
        v-model="imgUpload"
        label="Choose an image"
        accept="image/*"
        >
        <template v-slot:prepend>
          <q-icon name="eva-attach-outline" />
        </template>
      </q-file>
      <div class="row justify-center q-ma-md">
        <q-input
          class="col col-sm-6"
          v-model="post.caption"
          label="Caption"
          dense
        />
      </div>
      <div class="row justify-center q-ma-md">
        <q-input
          class="col col-sm-6"
          v-model="post.location"
          label="Location"
          dense
        >
          <template v-slot:append>
            <q-btn
              round
              dense
              flat
              icon="eva-navigation-2-outline" />
          </template>
        </q-input>
      </div>

      <div class="row justify-center q-mt-lg">
        <q-btn
          unelevated
          rounded
          color="primary"
          label="Post Image" />
      </div>
    </div>
  </q-page>
</template>

<script>
import { uid } from "quasar";

// require('md-gum-polyfill');

// ... code using getUserMedia...

export default {
  name: "PageCamera",
  data() {
    return {
      post: {
        id: uid(),
        caption: "",
        location: "",
        photo: null,
        date: Date.now(),
      },
      imgCaptured: false,
      imgUpload: [],
      hasCamera: true,
    };
  },
  methods: {
    getCamera() {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
        })
        .then((stream) => (this.$refs.video.srcObject = stream))
        .catch((error) => (this.hasCamera = false));
    },
    getImage() {
      let video = this.$refs.video;
      let canvas = this.$refs.canvas;
      canvas.width = video.getBoundingClientRect().width;
      canvas.height = video.getBoundingClientRect().height;
      canvas
        .getContext("2d")
        .drawImage(video, 0, 0, canvas.width, canvas.height);
      this.imgCaptured = true;
      this.post.photo = this.dataURItoBlob(canvas.toDataURL());
    },

    getImageFile(file){
      console.log(file);

      this.post.photo = file
      let canvas = this.$refs.canvas;

      var reader = new FileReader()
      reader.onload = event => {
        var img = new Image()
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          canvas
        .getContext("2d")
        .drawImage(img, 0, 0);
        this.imgCaptured = true
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)

    },

    dataURItoBlob(dataURI) {
      var byteString = atob(dataURI.split(",")[1]);
      var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
      var ab = new ArrayBuffer(byteString.length);
      var ia = new Uint8Array(ab);
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      var blob = new Blob([ab], { type: mimeString });
      return blob;
    },
  },
  mounted() {
    this.getCamera();
  },
};
</script>
<style lang="sass">
.camera
  border: 2px solid $grey-10
  border-radius: 10px
</style>
