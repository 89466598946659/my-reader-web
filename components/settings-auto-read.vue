<template>
  <div
    :class="{ 'mr-setting-auto-read': true, 'sticky': autoRead }"
    :style="{ maxWidth: settings.contentWidth + 'px', padding: '0 20px'}"
  >
    <el-switch v-model="autoRead" inactive-text="自动阅读" style="margin-right: 10px" @change="setAutoRead"/>
    <el-button size="small" @click="setSpeed(1)">速度 -</el-button>
    <el-button size="small" @click="setSpeed(2)">速度 +</el-button>
    <div style="margin-left: 8px">速度：{{settings.readSpeed}}</div>
  </div>
</template>

<script lang="ts">
  import '~/assets/css/setting-auto-read.less'
  // @ts-expect-error
  import { useReaderStore } from '~/stores/reader';
  
  export default {
    data() {
      return {
        autoRead: false,
        autoReadInstance: null,
      };
    },
    created() {
      this.readerStore = useReaderStore();
    },
    computed: {
      settings() {
        return this.readerStore.settings;
      },
    },
    unmounted() {
      clearInterval(this.autoReadInstance);
    },
    methods: {
      setAutoRead(value) {
        this.autoRead = value;
        if (value) {

          this.autoReadInstance = setInterval(() => {
            document.querySelector('.app-container').scrollBy(0, this.settings.readSpeed)
          }, 40);
        } else {
          clearInterval(this.autoReadInstance);
        }
      },
      setSpeed(type) {
        const speed = this.settings.readSpeed;
        if (speed <= 0.5 && type === 1) {
          return;
        }
        if (type === 1) {
          this.readerStore.setSettings('readSpeed', parseFloat((speed - 0.1).toFixed(1)));
        } else {

          this.readerStore.setSettings('readSpeed', parseFloat((speed + 0.1).toFixed(1)));
        }
        this.readerStore.saveStore();
      }
    }
  }
</script>