import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs'
import * as readline from 'readline';

const PERSONAL_OPINION = [
  "我觉得这个故事",
  "我觉得",
  "从我的角度来看",
  "这个故事告诉我们",
  "这个故事使我们",
  "这个故事表示",
  "通过这个故事",
  "总结",
  "总的来说"
]

@Injectable()
export class DetailTasksService {
  constructor() {}
  async readJsonFile(filePath: string): Promise<any> {
    try {
      const fileContent = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(fileContent);
    } catch (error) {
      console.error('Failed to read file:', error);
      throw new Error('Failed to read file');
    }
  }

  async writeJsonFile(filePath: string, jsonData: any) {
    try {
        const jsonString = JSON.stringify(jsonData, null, 2); // Thêm tham số null và 2 để định dạng đẹp JSON
        await fs.promises.writeFile(filePath, jsonString, 'utf8');
        console.log('File saved successfully.');
    } catch (error) {
        console.error('Failed to save file:', error);
        throw new Error('Failed to save file');
    }
  }

  async readFileLines(filePath: string): Promise<string[]> {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    const lines: string[] = [];
    for await (const line of rl) {
      lines.push(line);
    }

    return lines;
  }

  async checkSpacesBeginOfLines(text) {
    const SPACE_BEGINING = "  "
    let paragraphArr = text.split("\n")
    if(paragraphArr.length <= 1) paragraphArr = text.split("\r")
    
    for (let index = 0; index < paragraphArr.length; index++) {
        if(!paragraphArr[index].startsWith(SPACE_BEGINING)) {
            return false
        }
    }
    return true
}

  async getRandomSubarray(arr, size) {
    const shuffled = arr.slice(0); // Tạo một bản sao của mảng ban đầu để không làm thay đổi mảng gốc
    let i = arr.length;
    const min = i - size;
    while (i-- > min) {
        const index = Math.floor((i + 1) * Math.random());
        const temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    return shuffled.slice(min);
  }
  removePersonalOpinionSentences(text) {
    // Split the text into sentences based on 。！？ punctuation
    const sentences = text.split(/(?<=[。！？])/);
    
    // Filter out sentences that start with any value in PERSONAL_OPINION
    const filteredSentences = sentences.filter(sentence => {
      return !PERSONAL_OPINION.some(opinion => sentence.trim().startsWith(opinion));
    });
  
    return filteredSentences.join('');
  }

  uniqueObjectsByTerm(arr: any) {
    const uniqueTerms = new Set(arr.map(item => item.term));
  
    const uniqueObjects = [...uniqueTerms].map(term => {
      const obj = arr.find(item => item.term === term);
      return { term: obj.term, reason: obj.reason };
    });
  
    return uniqueObjects;
  }
  extractChineseCharacters(text) {
    const chineseCharRegex = /[\u4e00-\u9fff]+/g;
    const chineseWords = text.match(chineseCharRegex);
    return chineseWords || [];
  }

  countTokenText(text: string) {
    // const wordsToken = jieba.cut(text);
    // return wordsToken.length
    const regex  = new RegExp("[^a-zA-Z0-9\u4e00-\u9fa5]", "g")
    const textNotContainPunctuation = text.replace(regex, "");
    return textNotContainPunctuation.length
  }

  checkUpgradeObj_HSK6(upgradeObjHSK6) {
    if (typeof upgradeObjHSK6 !== 'object' || upgradeObjHSK6 === null) {
      return false;
    }
  
    function checkArray(arr) {
      return arr.every(item => {
        if (typeof item !== 'object' || item === null) {
          return false;
        }
        return Object.values(item).every(value => value);
      });
    }
  
    for (let key in upgradeObjHSK6) {
      if (!upgradeObjHSK6[key]) {
        return false;
      }
      if ((key === 'vocabularies' || key === 'sentences') && Array.isArray(upgradeObjHSK6[key])) {
        if (!checkArray(upgradeObjHSK6[key])) {
          return false;
        }
      }
    }
    return true;
  }

  containsLatin(text) {
    const latinRegex = /[A-Za-z]/;
    return latinRegex.test(text);
  }

  checkEnoughRequiredWords(requiredWords: string, inputText: string) {
    const requiredWordsArr = requiredWords.split("、")
    return requiredWordsArr.every(word => inputText.includes(word))
  }

  checkEqualLength(arr) {
    const lengths = new Set(arr.map(item => item.length));
    return lengths.size === 1;
  }

  getRandomElement(arr) {
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
  }

  extractQuotedSentences(data) {
    const parts = data.split(/[“”]/);
    const results = [];
    for (let i = 1; i < parts.length; i += 2) {
        results.push(parts[i]);
    }
    return results
  }
}