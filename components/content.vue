<template>
  <div class="mr-content-wrapper" :style="{
    width: settings.contentWidth + 'px',
    background: settings.background,
    color: settings.fontColor,
    fontSize: settings.fontSize + 'px',
  }" v-loading="loading">
    <div class="mr-content">
      <el-button v-if="!loaded" size="small" type="primary" @click="loadBook()">加载已上传的书籍</el-button>
      <div v-if="loaded">
        <div class="mr-content-title">
          <h3>
            {{ book.chapterTitle }}({{chapterLength}}字)
          </h3>
        </div>
        <div class="mr-content-content">
          <p v-for="(line, index) in book.chapterContent" :key="index" :style="{ lineHeight: settings.lineHeight }">
            {{ line }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import '~/assets/css/content.less';
  // @ts-expect-error
  import { useReaderStore } from '~/stores/reader';
  import axios from 'axios';

  export default {
    data() {
      return {};
    },
    created() {
      this.readerStore = useReaderStore();
      // 整个应用，只需调用一次即可
      this.readerStore.recoveryStore();
      setTimeout(() => {
        if (this.readerStore.book.name) {
          this.loadBook(this.readerStore.book.chapterTitle);
        }
      }, 200);
    },
    computed: {
      settings() {
        return this.readerStore.settings;
      },
      book() {
        return this.readerStore.book;
      },
      loaded() {
        return this.readerStore.loaded;
      },
      loading() {
        return this.readerStore.loading;
      },
      chapterLength() {
        return this.readerStore.book.chapterContent?.reduce((pre, cur) => pre + cur.length, 0);
      },
    },
    methods: {
      async loadBook(chapterTitle?: string) {
        const bookName = this.readerStore.book.name;
        if (!bookName) {
          return;
        }
        this.readerStore.setLoading(true);
        // 获取目录
        const catalogRes = await axios.get(`/api/get-catalog?book_name=${bookName}`);
        if (catalogRes.data.code === 0) {
          this.readerStore.setCatalog(catalogRes.data.data);
          if (catalogRes.data.data?.length === 0) {
            this.readerStore.setLoading(false);
            return;
          }
        } else {
          console.log('fetch catalog error: ', catalogRes);
          this.readerStore.setLoading(false);
          return;
        }
        let finalChapterTitle = chapterTitle;
        if (!chapterTitle) {
          finalChapterTitle = catalogRes.data.data[0]?.title;
          this.readerStore.setBook('chapterTitle', finalChapterTitle);
          // 没有 chapterTitle 时，标明是第一次进入，需要保存下
          this.readerStore.saveStore();
        }

        // 获取章节内容
        await this.readerStore.loadChapter(finalChapterTitle);
      },
    }
  }
</script>