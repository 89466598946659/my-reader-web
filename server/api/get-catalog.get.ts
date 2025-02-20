import { defineEventHandler, H3Event, EventHandlerRequest, getQuery } from 'h3';
import { readFileSync } from 'fs';
import { join } from 'path';
import CONSTANT from '~/config/constant';

/**
 * 获取书目录内容
 * book_name：书名
 */
export default defineEventHandler((event: H3Event<EventHandlerRequest>) => {
  const bookName = getQuery(event).book_name as string;
  try {
    const filePath = join(CONSTANT.BOOKS_DIR, bookName, CONSTANT.CATALOG_NAME);
    const fileContent = readFileSync(filePath, 'utf-8');
    const content = JSON.parse(fileContent);
    
    return {
      code: 0,
      success: true,
      data: content.catalog,
    }
  } catch (e: any) {
    return {
      code: 0,
      success: false,
      data: '获取目录失败：' + e.message,
    }
  }
})