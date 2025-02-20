<template>
  <div class="mr-upload-wrapper">
    <el-upload
      class="mr-upload"
      action="http://localhost:3000/api/upload-file"
      ref="upload"
      :on-remove="handleRemove"
      :multiple="false"
      :limit="1"
      name="novel"
      accept=".txt"
      :on-exceed="handleExceed"
      :on-success="handleSuccess"
      :on-error="handleError"
      :auto-upload="false"
    >
      <div class="my-upload-btns">
        <div class="my-upload-btn">
          <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
          <el-button style="margin-left: 10px" size="small" type="success" @click="submitUpload">点击上传{{aaa}}</el-button>
        </div>
        <div slot="tip" class="el-upload__tip">只能上传txt文件，文件大小不超过20Mb</div>
        <div slot="tip" class="el-upload__tip" v-if="file.size">{{`上传成功，文件大小 ${parseInt(file.size / 1024)} Kb`}}</div>
      </div>
    </el-upload>

    <el-select style="margin-left: 30px; width: 200px" v-model="book.name" placeholder="请选择书籍" @change="handleSelectBook">
      <el-option
        v-for="item in books"
        :key="item"
        :label="item"
        :value="item"
      />
    </el-select>
  </div>
</template>

<script lang="ts">
  import '~/assets/css/upload.less';
  // @ts-expect-error
  import { useReaderStore } from '~/stores/reader';

  export default {
    data() {
      return {
        fileList: [],
        file: {},
        error: '',
        aaa: '',
      };
    },
    created() {
      this.readerStore = useReaderStore();
      this.readerStore.loadBooks();
    },
    computed: {
      settings() {
        return this.readerStore.settings;
      },
      books() {
        return this.readerStore.books;
      },
      book() {
        return this.readerStore.book;
      },
    },
    methods: {
      submitUpload() {
        this.$refs.upload.submit();
      },
      handleRemove(file, fileList) {
        console.log(file, fileList);
        this.file = {};
        this.error = '';
      },
      handleExceed(files, fileList) {
        this.$message.warning(`当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
      },
      // beforeRemove(file, fileList) {
      //   return this.$confirm(`确定移除 ${ file.name }？`);
      // },
      handleSuccess(res, file) {
        if (res.code === 0 && res.success) {
          this.file = file;
          this.$message({
            message: '上传成功， 请点击下方查看正文按钮',
            type: 'success',
          });
          this.readerStore.setBook('name', file.name.split('.')[0]);
          this.readerStore.setBook('chapterTitle', '');
          this.readerStore.setBook('chapterContent', '');
          this.readerStore.setLoaded(false);
          this.readerStore.setCatalog([]);
          console.log('upload success, file: ', file);
        } else {
          this.error = res.data;
        }
      },
      handleError(res, file, fileList) {
        console.log('error', res, file, fileList);
      },
      handleSelectBook(value) {
        // 切换书以后，清空其他的数据
        this.readerStore.setBook('chapterTitle', '');
        this.readerStore.setBook('chapterContent', '');
        this.readerStore.setLoaded(false);
        this.readerStore.setCatalog([]);
      },
    },
  }
</script>