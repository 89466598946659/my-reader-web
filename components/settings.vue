<template>
  <div class="mr-setting-wrapper" :style="{ width: settings.contentWidth + 'px', padding: '0 20px'}">
    <div class="mr-setting">
      <div class="mr-setting-1">
        <div class="mr-setting-block">
          <span>页面背景色</span>
          <el-color-picker size="small" v-model="settings.globalBackground" @change="setGlobalBackground" />
        </div>
        <div class="mr-setting-block">
          <span>文字背景色</span>
          <el-color-picker size="small" v-model="settings.background" @change="setBackground" />
        </div>
        <div class="mr-setting-block">
          <span>文字颜色</span>
          <el-color-picker size="small" v-model="settings.fontColor" @change="setFontColor" />
        </div>
      </div>
      
      <div class="mr-setting-2">
        <div class="mr-setting-block mr-setting-width">
          <el-button size="small" @click="setWidth(1)">内容宽度 -</el-button>
          <el-button size="small" @click="setWidth(2)">内容宽度 +</el-button>
        </div>
        <div class="mr-setting-block mr-setting-linehight">
          <el-button size="small" @click="setLineheight(1)">行高 -</el-button>
          <el-button size="small" @click="setLineheight(2)">行高 +</el-button>
        </div>
        <div class="mr-setting-block mr-setting-font">
          <el-button size="small" @click="setFontSize(1)">字体 -</el-button>
          <el-button size="small" @click="setFontSize(2)">字体 +</el-button>
        </div>
      </div>

      <div class="mr-setting-catalog">
        <el-collapse v-model="catalogVisible">
          <el-collapse-item name="open" title="书籍目录（双击标题跳转到该章节，括号内为字数）">
            <el-button class="locate-current" size="small" @click="locateCurrentChapter">定位到当前章节</el-button>
            <div class="mr-setting-catalog-list">
              <div
                v-for="(item, index) in catalog"
                :class="{'mr-catalog-title': true, 'current': item.title === book.chapterTitle, 'find-current': scrollFind}"
                :key="index"
                @dblclick="goToChapter(item)"
              >
                {{item.title}}({{item.length}})
              </div>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import '~/assets/css/setting.less'
  // @ts-expect-error
  import { useReaderStore } from '~/stores/reader';
  
  export default {
    data() {
      return {
        catalogVisible: [],
        scrollFind: false,
      };
    },
    created() {
      this.readerStore = useReaderStore();
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
    },
    unmounted() {
      clearInterval(this.autoReadInstance);
    },
    methods: {
      goToChapter(item) {
        this.readerStore.loadChapter(item?.title);
        this.catalogVisible = [];
        document.querySelector('.app-container')?.scrollTo(0, 0)
      },
      handleClose() {
        this.catalogVisible = false;
      },
      setWidth(type) {
        const width = this.settings.contentWidth;
        if (type === 1) {
          this.readerStore.setSettings('contentWidth', width - 5);
        } else {
          this.readerStore.setSettings('contentWidth', width + 5);
        }
        this.readerStore.saveStore();
      },
      setLineheight(type) {
        const lineHeight = this.settings.lineHeight;
        if (lineHeight <= 1 && type === 1) {
          return;
        }
        if (type === 1) {
          this.readerStore.setSettings('lineHeight', parseFloat((lineHeight - 0.1).toFixed(1)));
        } else {
          this.readerStore.setSettings('lineHeight', parseFloat((lineHeight + 0.1).toFixed(1)));
        }
        this.readerStore.saveStore();
      },
      setFontSize(size) {
        const fontSize = this.settings.fontSize;
        if (size === 1) {
          this.readerStore.setSettings('fontSize', fontSize - 1);
        } else {
          this.readerStore.setSettings('fontSize', fontSize + 1);
        }
        this.readerStore.saveStore();
      },
      setGlobalBackground(color) {
        this.readerStore.setSettings('globalBackground', color);
        this.readerStore.saveStore();
      },
      setBackground(color) {
        this.readerStore.setSettings('background', color);
        this.readerStore.saveStore();
      },
      setFontColor(color) {
        this.readerStore.setSettings('fontColor', color);
        this.readerStore.saveStore();
      },
      locateCurrentChapter() {
        this.scrollFind = false;
        const target = document.querySelector('.mr-catalog-title.current');
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        setTimeout(() => {
          this.scrollFind = true;
        }, 400);
      },
    }
  }
</script>