import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class JsonService {
  readJsonFile(filePath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (error, rawData) => {
        if (error) {
          reject(error);
          return;
        }

        try {
          const jsonData = JSON.parse(rawData);
          resolve(jsonData);
        } catch (parseError) {
          reject(parseError);
        }
      });
    });
  }
}
