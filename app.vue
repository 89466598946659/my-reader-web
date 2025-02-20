<template>
  <div class="app-container" :style="{background: settings.globalBackground}">
    <upload />
    <div class="gap">.</div>
    <settings-auto-read />
    <div class="gap">.</div>
    <settings />
    <div class="gap">.</div>
    <content />
    <div class="gap">.</div>
    <page />
    <el-backtop target=".app-container" visibility-height="100"></el-backtop>
  </div>

</template>

<script lang="ts">
  import '~/assets/css/global.less'
  // @ts-expect-error
  import { useReaderStore } from '~/stores/reader';

  export default {
    data() {
      return {};
    },
    created() {
      this.readerStore = useReaderStore();
    },
    computed: {
      settings() {
        return this.readerStore.settings;
      },
    },
    methods: {}
  }
</script>