// stores/counter.js
import { defineStore } from 'pinia';
import axios from 'axios';

interface ReaderState {
  settings: {
    background: string;
    globalBackground: string;
    fontColor: string;
    fontSize: number;
    lineHeight: number;
    contentWidth: number;
    readSpeed: number;
  };
  uploadFile: any;
  error: string | undefined;
  loaded: boolean; // 第一次刚上传书之后的加载
  loading: boolean; // 刷新页面的加载以及上下章的加载
  book: {
    name?: string;
    chapterTitle?: string;
    chapterContent?: string;
  };
  catalog: {title: string, length: number}[];
  books: string[],
}

export const useReaderStore = defineStore('reader', {
  state: (): ReaderState => ({
    settings: {
      background: '#ffffff',
      globalBackground: '#ffffff',
      fontColor: '#000000',
      fontSize: 16,
      lineHeight: 1.5,
      contentWidth: 1000,
      readSpeed: 1,
    },
    uploadFile: {},
    error: undefined,
    loaded: false,
    loading: false,
    book: {
      name: '',
      chapterTitle: '',
      chapterContent: '',
    },
    catalog: [],
    books: [],
  }),
  actions: {
    setSettings(key: keyof ReaderState['settings'], value: any) {
      // @ts-expect-error
      this.settings[key] = value;
    },
    setBook(key: keyof ReaderState['book'], value: string) {
      this.book[key] = value;
    },
    setBooks(books: string[]) {
      this.books = books;
    },
    setCatalog(catalog: ReaderState['catalog']) {
      this.catalog = catalog;
    },
    setLoaded(loaded: boolean) {
      this.loaded = loaded;
    },
    setLoading(loading: boolean) {
      this.loading = loading;
    },
    setError(error: string | undefined) {
      this.error = error;
    },
    setUploadFile(uploadFile: any) {
      this.uploadFile = uploadFile;
    },
    saveStore() {
      setTimeout(() => {
        try {
          localStorage.setItem('mr-web-save', JSON.stringify({
            settings: this.settings,
            book: {
              chapterTitle: this.book.chapterTitle,
              name: this.book.name,
            },
          }));
        } catch (e) {
          console.log('save store error:', e);
        }
      }, 500);
    },
    recoveryStore() {
      try {
        const store = localStorage.getItem('mr-web-save');
        if (store) {
          const storeData = JSON.parse(store);
          console.log('the local data is: ', storeData);
          this.settings = storeData.settings;
          this.book.chapterTitle = storeData.book.chapterTitle || '';
          this.book.name = storeData.book.name || '';
        }
      } catch (e) {
        console.log('recovery store error:', e);
      }
    },
    async loadChapter(chapterTitle: string) {
      if (!chapterTitle) {
        return;
      }
      this.setLoading(true);
      const res = await axios.get(`/api/get-chaptor?book_name=${this.book.name}&chapter_name=${chapterTitle}`);
      const { data } = res;
      if (data.code === 0 && data.success) {
        this.setLoading(false);
        this.setLoaded(true);
        this.setBook('chapterTitle', chapterTitle);
        this.setBook('chapterContent', data.data.split('\n'));
      } else {
        console.log('fetch chapter error: ', res);
      }
      this.saveStore();
    },
    async loadBooks() {
      const res = await axios.get('/api/get-books');
      const { data } = res;
      if (data.code === 0 && data.success) {
        this.setBooks(data.data);
      } else {
        console.log('fetch chapter error: ', res);
      }
    }
  },
  getters: {
    // doubleCount: (state) => state.count * 2
  }
})