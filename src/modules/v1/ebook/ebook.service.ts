import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CreateEbookDto, PaginateEbookFilterDto, SynchronizeEbookUserArrayDto, UpdateEbookDetail } from './dtos/ebook.dto';
import { EbookRepository } from './repo/ebook-user.repository';
import { EbooksUsersRepository } from './repo/ebook.repository';
import { IResponse } from 'src/common/interfaces/response.interface';
import { OptionEbookEnum, TypeEbookEnum } from './enums/ebook.enum';
import { SystemService } from 'src/modules/system/system.service';
import { SUPPER_KEY } from 'src/middleware/supper-key.middleware';

@Injectable()
export class EbookService {
  constructor(
    private readonly configService: ConfigService,
    private readonly ebookRepository: EbookRepository,
    private readonly ebooksUsersRepository: EbooksUsersRepository,
  ) {}

  getProgressAndCheckPointById(data, ebookId: number) {
    const ebook = data.find(item => item.ebook_id === ebookId);
    return {
      is_downloaded: ebook ? ebook?.is_downloaded : 0,
      progress: ebook ? ebook?.progress : 0,
      page_checkpoint: ebook ? ebook?.page_checkpoint : 0,
    }
  }

  sortAudioUrls(audioArray) {
    return audioArray.sort((a, b) => {
        const getSortableKey = (url) => {
            const filename = url.split("/").pop().split(".")[0];
            return filename.split("_").map(part => isNaN(part) ? part : part.padStart(3, '0')).join("_");
        };
        
        const keyA = getSortableKey(a.url);
        const keyB = getSortableKey(b.url);
        
        return keyA.localeCompare(keyB, undefined, { numeric: true });
    });
  }

  async getOptionEbook(user_id: string, paginateEbookFilterDto: PaginateEbookFilterDto) {
    try {
      const findEbookUserDetailRaw = await this.ebooksUsersRepository.query("select id, user_id, favourites, content from ebooks_users where user_id = ?", [+user_id])
      const ebookUserDetail = findEbookUserDetailRaw[0]
      const favouritesEbookUser  = ebookUserDetail ? JSON.parse(ebookUserDetail.favourites) : []
      const contentEbookUser = ebookUserDetail ? JSON.parse(ebookUserDetail.content) : []
      const completedEbookUser  = contentEbookUser ? contentEbookUser.filter(ele => +ele.progress == 100).map(ele => ele.ebook_id) : []
      const progressEbookUser  = contentEbookUser ? contentEbookUser.filter(ele => ele.progress).map(ele => ele.ebook_id) : []
      const {page, lang, limit, filter, type} = paginateEbookFilterDto
      const offset = (page - 1) * limit;

      const QUERY_FIX_TRUE = "1=1"
      let query = `SELECT * FROM ebooks WHERE (language = "cn" OR language = "${lang}") AND is_open_app = 1`;
      const params: any[] = [];

      if (filter && filter != OptionEbookEnum.DEFAULT) {
        if(filter === OptionEbookEnum.FAVOURITE) {
          if(!favouritesEbookUser.length) 
            throw new HttpException(
              `Ebook is not found.`,
              HttpStatus.NOT_FOUND,
            );
          query += " AND id in (?)";
          params.push(favouritesEbookUser);
        }

        if(filter === OptionEbookEnum.IN_PROGRESS) {
          if(!progressEbookUser.length) 
            throw new HttpException(
              `Ebook is not found.`,
              HttpStatus.NOT_FOUND,
            );
          query += " AND id in (?)";
          params.push(progressEbookUser);
        }
      }

      if (type && type != TypeEbookEnum.DEFAULT) {
        query += " AND type = ?";
        params.push(type);
      }

      query += " ORDER BY priority ASC LIMIT ? OFFSET ?";
      params.push(+limit, +offset);

      const findEbookOption = await this.ebooksUsersRepository.query(query, params);
      if(!findEbookOption.length) {
        throw new HttpException(
          `Ebook is not found.`,
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        ebooks: findEbookOption.map(ele => {
          ele.is_favourite = favouritesEbookUser.includes(ele.id) ? 1 : 0;
          const {is_downloaded, progress, page_checkpoint} = this.getProgressAndCheckPointById(contentEbookUser, ele.id)
          ele.is_downloaded = is_downloaded
          ele.progress = progress
          ele.page_checkpoint = page_checkpoint
          const audio_url_short = JSON.parse(ele.audio_url)
          return {
            ...ele,
            name: JSON.parse(ele.name),
            audio_url: this.sortAudioUrls(audio_url_short),
            type_lang: JSON.parse(ele.type_lang),
            author: JSON.parse(ele.author),
          }
        }),
        progress: progressEbookUser.length,
        completed: completedEbookUser.length
      }
    } catch (error) {
      
      if (error instanceof HttpException) {
          throw error; 
      }
      const response: IResponse = {
          message: "Get Ebook Option failed.",
          data: {}
      }
      throw new HttpException(response, HttpStatus.BAD_REQUEST)  
    }
  }

  async createNewEbook(file: any) {
    const jsonData = JSON.parse(file.buffer.toString('utf-8')); 
    const dataSave = await this.ebookRepository.create(jsonData)
    return dataSave
  }

  async deleteEbooks(key_use: string) {
    if(key_use !== SUPPER_KEY[0].key_use) return null
    await this.ebookRepository.query(`DELETE FROM ebooks;`)
    await this.ebooksUsersRepository.query(`DELETE FROM ebooks_users;`)
    return "Success !!!"
  }

  async updateEbookDetail(key_use: string, ebookId: string, updateEbookDetail: UpdateEbookDetail) {
    if(key_use !== SUPPER_KEY[0].key_use) return null
    await this.ebookRepository.update(+ebookId, updateEbookDetail)
    return "Update successfully !!!"
  }

  async synchorizeEbookUser(user_id: string, synchronizeEbookUserArrayDto: SynchronizeEbookUserArrayDto) {
    try {
      const findEbookUserDetailRaw = await this.ebooksUsersRepository.query("select id, user_id, favourites, content from ebooks_users where user_id = ?", [+user_id])
      const ebookUserDetail = findEbookUserDetailRaw[0]
      let upgradeFavourites = ebookUserDetail ? JSON.parse(ebookUserDetail.favourites) : []
      const upgradeContent = ebookUserDetail ? JSON.parse(ebookUserDetail.content) : []
      for(const input of synchronizeEbookUserArrayDto.synchronizedEbook) { 
        const {ebook_id, progress, is_favourite, page_checkpoint, is_downloaded} = input
        if(ebook_id) {
          if(is_favourite && !upgradeFavourites.includes(ebook_id)) {
            upgradeFavourites.push(ebook_id)
          }
          if(!is_favourite) {
            upgradeFavourites = upgradeFavourites.filter(num => num != ebook_id)
          }

          const indexContent = upgradeContent.findIndex(ebook => ebook.ebook_id === ebook_id)
          if(indexContent >= 0) {
            upgradeContent[indexContent] = {
              ...upgradeContent[indexContent],
              progress: progress ? progress: 0,
              is_favourite: is_favourite ? is_favourite: 0,
              page_checkpoint: page_checkpoint ? page_checkpoint: 0,
              is_downloaded: is_downloaded ? is_downloaded: 0,
            }
          } else {
            upgradeContent.push({
              ebook_id: ebook_id,
              progress: progress ? progress: 0,
              is_favourite: is_favourite ? is_favourite: 0,
              page_checkpoint: page_checkpoint ? page_checkpoint: 0,
              is_downloaded: is_downloaded ? is_downloaded: 0,
            })
          }
        }
      }

      if(ebookUserDetail) {
        await this.ebooksUsersRepository.update(ebookUserDetail.id, {
          favourites: JSON.stringify(upgradeFavourites),
          content: JSON.stringify(upgradeContent),
        })
        
      } else {
        const newEbookUser = await this.ebooksUsersRepository.create({
          user_id: +user_id,
          favourites: JSON.stringify(upgradeFavourites),
          content: JSON.stringify(upgradeContent),
        })
      }
      return {
        user_id: +user_id,
        favourites: upgradeFavourites,
        content: upgradeContent,
      }
    } catch (error) {
      
      if (error instanceof HttpException) {
          throw error; 
      }
      const response: IResponse = {
          message: "Update Ebook for user failed.",
          data: {}
      }
      throw new HttpException(response, HttpStatus.BAD_REQUEST)  
    }
  }
}
