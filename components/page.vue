<template>
  <div class="mr-page-wrapper">
    <el-button size="small" @click="loadChapter('previous')">上一章 {{catalog[currentIndex - 1]?.title}}</el-button>
    <el-button size="small" @click="loadChapter('next')">下一章 {{catalog[currentIndex + 1]?.title}}</el-button>
  </div>
</template>

<script lang="ts">
  import '~/assets/css/page.less';
  // @ts-expect-error
  import { useReaderStore } from '~/stores/reader';

  export default {
    data() {
      return {};
    },
    created() {
      this.readerStore = useReaderStore();
      document.addEventListener('keydown', (event) => {
        const key = event.key;
        if (key === 'ArrowLeft') {
          this.loadChapter('previous')
        }
        if (key === 'ArrowRight') {
          this.loadChapter('next')
        }
      });
    },
    computed: {
      settings() {
        return this.readerStore.settings;
      },
      book() {
        return this.readerStore.book;
      },
      catalog() {
        return this.readerStore.catalog;
      },
      currentIndex() {
        return this.catalog.findIndex(item => item.title === this.book.chapterTitle);
      },
    },
    methods: {
      async loadChapter(type) {
        let targetChapterTitle = '';
        const index = this.currentIndex;
        if (type === 'previous') {
          if (index === 0) {
            this.$message({
              message: '已经是第一章了',
              type: 'warning',
            });
            return;
          }
          targetChapterTitle = this.catalog[index - 1]?.title;
        } else if (type === 'next') {
          if (index === this.catalog.length - 1) {
            this.$message({
              message: '已经是最后一章了',
              type: 'warning',
            });
            return;
          }
          targetChapterTitle = this.catalog[index + 1]?.title;
        }
        await this.readerStore.loadChapter(targetChapterTitle);
        document.querySelector('.app-container')?.scrollTo(0, 0);
      },
    }
  }
</script>