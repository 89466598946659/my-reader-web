
import { defineEventHandler, H3Event, EventHandlerRequest, getQuery } from 'h3';
import { readdirSync } from 'fs';
import { join } from 'path';
import CONSTANT from '~/config/constant';

/**
 * 获取本地存储的所有书
 */
export default defineEventHandler((event: H3Event<EventHandlerRequest>) => {
  try {
    const filePath = join(CONSTANT.BOOKS_DIR);
    // 只会读取第一层文件，不会递归
    const dirs = readdirSync(filePath, { withFileTypes: true});
    const books = dirs.filter(dir => !dir.name.includes('.'));
    
    return {
      code: 0,
      success: true,
      data: books.map(book => book.name),
    }
  } catch (e: any) {
    return {
      code: 0,
      success: false,
      data: '获取目录失败：' + e.message,
    }
  }
})