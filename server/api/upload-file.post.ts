import { defineEventHandler, readMultipartFormData } from 'h3';
import { join } from 'path';
import { promises as fsPromises, createWriteStream, createReadStream, unlinkSync, existsSync, mkdirSync } from 'fs';
import { detect } from 'jschardet';
import iconv from 'iconv-lite';
import CONSTANT from '~/config/constant';

// 保存章节到本地文件
async function saveFile(bookPath: string, title: string, content: string, ext?: string) {
  const extension = ext ? ext : 'txt';
  const chapterFilePath = join(bookPath, `${title}.${extension}`);
  console.log('Saving chapter path: ', chapterFilePath);
  await fsPromises.writeFile(chapterFilePath, content, { encoding: 'utf-8' });
}

// 创建目录
function createDir(path: string) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

// 逐行读取文件
async function* readLines(readable: NodeJS.ReadableStream) {
  let text = '';
  for await (const chunk of readable) {
    text += chunk;
  }
  const lines = text.split('\n');
  for (const line of lines) {
    yield line;
  }
}

// 解析小说文件
async function parseNovel(filePath: string, fileName: string = '') {
  const readStream = createReadStream(filePath, { encoding: 'utf-8' });
  let currentChapter = '';
  let currentTitle = '';
  let isNewChapter = false;

  const fileNameWithoutExt = fileName?.split('.')[0];
  const chaptersPath = join(CONSTANT.BOOKS_DIR, fileNameWithoutExt, CONSTANT.CHAPTERS);
  createDir(chaptersPath);

  const bookPath = join(CONSTANT.BOOKS_DIR, fileNameWithoutExt);
  // 所有的目录
  const catalog = [];

  for await (const line of readLines(readStream)) {
    if (!line.trim()) {
      continue;
    }
    const chapterMatch = line.match(/^\s?第[一二三四五六七八九十百千0-9两零]+章/); // 有的章节是 第两百零一章 这种，需要有”两“、”零“
    if (chapterMatch && line.length < 200) {
      if (currentTitle) {
        catalog.push({
          title: currentTitle,
          length: currentChapter.length,
        });
        await saveFile(chaptersPath, currentTitle, currentChapter);
      }
      currentTitle = line.trim().replace(/\r/g, '').replace(/[\/\\:*?<>|]/g, '_'); // 一些特殊的符号替换成 _，否则可能理解有误，无法写入文件名
      currentChapter = line.replace(currentTitle, '').trim();
      isNewChapter = true;
    } else {
      if (isNewChapter) {
        currentChapter += '\n' + line.trim();
      }
    }
  }

  if (currentTitle) {
    catalog.push({
      title: currentTitle,
      length: currentChapter.length,
    });
    await saveFile(chaptersPath, currentTitle, currentChapter);
  }

  // 保存目录
  saveFile(
    bookPath,
    CONSTANT.CATALOG_NAME_WITHOUT_EXT,
    JSON.stringify({
      catalog,
    }),
    'json'
  );

  // 删除上传的临时文件
  unlinkSync(filePath);
}

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);
  const file = formData?.find(item => item.name === 'novel');
  
  if (!file) {
    return {
      statusCode: 400,
      body: '未找到小说文件',
    };
  }

  // 检测文件编码，如果非UTF-8，则统一转为 UTF-8
  const encoding = detect(file.data).encoding;
  let utf8Data;
  console.log('-- file encoding is: ' + encoding);
  if (encoding === 'UTF-8') {
    utf8Data = file.data;
  } else {
    const tempData = iconv.decode(file.data, encoding);
    utf8Data = iconv.encode(tempData, 'utf-8');
  }

  const tempDirPath = join(CONSTANT.TEMP_DIR);
  createDir(tempDirPath);
  const tempFilePath = join(tempDirPath, file.filename || '');
  const writeStream = createWriteStream(tempFilePath, { mode: 0o666, encoding: 'utf-8' });
  try {

    // 使用 writeStream 直接写入 Buffer 数据
    writeStream.write(utf8Data);
    writeStream.end();

    // 等待写入完成
    await new Promise((resolve, reject) => {
      writeStream.on('finish', resolve as any);
      writeStream.on('error', reject);
    });

    // 解析小说，生成目录、章节文件保存到 books 目录下
    await parseNovel(tempFilePath, file.filename);
    return {
      code: 0,
      success: true,
      data: '文件上传并解析成功'
    };
  } catch (error: any) {
    return {
      code: -1,
      success: false,
      body: `文件解析出错：${error.message}`
    };
  }
});