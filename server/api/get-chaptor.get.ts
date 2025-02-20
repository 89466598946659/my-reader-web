import { defineEventHandler, H3Event, EventHandlerRequest, getQuery } from 'h3';
import { readFileSync } from 'fs';
import { join } from 'path';
import CONSTANT from '~/config/constant';

/**
 * 获取章节内容
 * book_name：书名
 * chapter_name：章节名
 */
export default defineEventHandler((event: H3Event<EventHandlerRequest>) => {
  const query = getQuery(event);
  const bookName = query.book_name as string;
  const chapterName = query.chapter_name as string;
  try {
    const filePath = join(CONSTANT.BOOKS_DIR, bookName, CONSTANT.CHAPTERS, `${chapterName}.txt`);
    console.log('== get chaptor, path: ', filePath);
    const fileContent = readFileSync(filePath, 'utf-8');
    
    return {
      code: 0,
      success: true,
      data: fileContent,
    }
  } catch (e: any) {
    return {
      code: 0,
      success: false,
      data: '获取目录失败：' + e.message,
    }
  }
})