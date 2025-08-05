import { Injectable, OnModuleInit } from '@nestjs/common';
import { promises as fsP } from 'fs';
import * as fs from 'fs';
import { join } from 'path';
import * as moment from 'moment';
const LOG_FOLDER = "uploads/logs"

@Injectable()
export class FileService implements OnModuleInit{
    async onModuleInit() { 
      if (fs.existsSync(LOG_FOLDER)) {
        await this.deleteFolderRecursive(LOG_FOLDER);
        console.log(`Thư mục '${LOG_FOLDER}' đã được xóa.`);
    }

    }
    private async deleteFolderRecursive(path: string): Promise<void> {
      if (fs.existsSync(path)) {
          for (const file of await fsP.readdir(path)) {
              const curPath = join(path, file);
              if ((await fsP.stat(curPath)).isDirectory()) {
                  await this.deleteFolderRecursive(curPath);
              } else {
                  await fsP.unlink(curPath);
              }
          }
          await fsP.rmdir(path);
      }
  }

    async addValueToFile(value: any, fileName: string): Promise<void> {
      if (!fs.existsSync(LOG_FOLDER)) {
        fs.mkdirSync(LOG_FOLDER, { recursive: true });
        console.log(`Thư mục '${LOG_FOLDER}' đã được tạo.`);
      }
      const date = moment().format('YYYY-MM-DD HH:mm:ss')

      const filePath = join(process.cwd(), fileName);
      const data = `${date}: ${JSON.stringify(value, null, 2)}\n`;
      await fsP.appendFile(filePath, data, 'utf8');
    }
}
