import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from "@sentry/node";
import { CreateTheoryNotebookArrayDto, CreateTheoryNotebookDto, PaginateTheoryFilterDto } from './dtos/createTheoryNotebook.dto';
import { TheoryNotebookRepository } from './theory-notebook.reponsitory';
import { KindFilterEnum, UnderstandLevelFilterEnum } from './enums/theoryNotebook.enum';
@Injectable()
export class TheoryNotebookService {
  constructor(
    private readonly configService: ConfigService,
    private readonly theoryNotebookRepository: TheoryNotebookRepository,
  ) {}

  async getOptionTheoryNotebook(user_id: string, paginateTheoryFilterDto: PaginateTheoryFilterDto) {
    const {page, limit, level, filter, kind} = paginateTheoryFilterDto
    try {
      if (kind !== KindFilterEnum.HANZII) {
        const dataSynchronizeLoopBackRaw = await this.theoryNotebookRepository.query(`SELECT id, content FROM users_synchronized WHERE id = "${user_id}"`)
        if(dataSynchronizeLoopBackRaw.length) {
          const theoryCurrentNew = await this.theoryNotebookRepository.query(`SELECT kind FROM theory_notebook where user_id = ?`, [+user_id])
          const theoryWord = theoryCurrentNew.filter(ele => ele.kind === KindFilterEnum.WORD)
          const theoryGrammar = theoryCurrentNew.filter(ele => ele.kind === KindFilterEnum.GRAMMAR)
          const dataSynchronizeLoopBack = JSON.parse(dataSynchronizeLoopBackRaw[0].content)
          const listVocabulary = dataSynchronizeLoopBack.listVocab ? dataSynchronizeLoopBack.listVocab : []
          const listVGrammar = dataSynchronizeLoopBack.listGrammar ? dataSynchronizeLoopBack.listGrammar : []

          if (listVocabulary && listVocabulary.length > theoryWord.length) {
            for (const word of listVocabulary) {
              await this.theoryNotebookRepository.query("INSERT INTO theory_notebook (user_id, word, kind, tick) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE tick = ?", [+user_id, word, KindFilterEnum.WORD, 1, 1])
            }
          }

          if (listVGrammar && listVGrammar.length > theoryGrammar.length) {
            for (const grammarId of listVGrammar) {
              await this.theoryNotebookRepository.query("INSERT INTO theory_notebook (user_id, theory_id, kind, tick, click) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE tick = ?, click = ?", [+user_id, +grammarId, KindFilterEnum.GRAMMAR, 1, 1, 1, 1])
            }
          }
        }

      }
      let whereConditon: any = [
        {user_id: +user_id, kind: kind}
      ]
      if (+level) {
        whereConditon = [
          {user_id: +user_id, level: +level, kind: kind},
          {user_id: +user_id, level: null, kind: kind}
        ]
      }
      if(+filter) {
        whereConditon = [
          { understand_level: +filter, user_id: +user_id, level: +level, kind: kind}
        ]
      }

      const allTheoryNotebookOption = await this.theoryNotebookRepository.findOption({
        where: whereConditon,
        order: {
          created_at: "DESC"
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      for(const tmp of allTheoryNotebookOption) {
        tmp.created_at = new Date(tmp.created_at).getTime()
        tmp.updated_at = new Date(tmp.updated_at).getTime()
      }
      
      const dataResponse = {
        message: 'Get all theory notebook by option successfully',
        data: allTheoryNotebookOption,
      };
      return dataResponse
    } catch (error) {
      console.log(error)
      if (error instanceof HttpException) {
        throw error; 
      }
      throw new HttpException(
        `Internal server error`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createNewTheoryNotebook(user_id: string, data: CreateTheoryNotebookArrayDto) {
    try {
      const idsTheorySuccess = []
      const idsTheoryFailed = []
      for(const input of data.theoryInput) {
        const {theoryId, takeNote, tick, understandLevel, level, kind, click, word, grammar, hanzii} = input
        const findTheoryNotebookDetail = await this.theoryNotebookRepository.findByCondition({theory_id: +theoryId, user_id: +user_id})
        if(findTheoryNotebookDetail) {
          const checkSuccess = await this.updateNewTheoryNotebook(user_id, input)
          if(checkSuccess?.affected) idsTheorySuccess.push(findTheoryNotebookDetail.theory_id)
          else idsTheoryFailed.push(findTheoryNotebookDetail.theory_id)
        }
        else {
          const theoryNotebookData = {
            user_id: +user_id,
            theory_id: +theoryId,
            level: +level,
          };
          if(understandLevel) theoryNotebookData["understand_level"] = +understandLevel
          if(tick) theoryNotebookData["tick"] = +tick
          if(kind) theoryNotebookData["kind"] = kind
          if(click) theoryNotebookData["click"] = +click
          theoryNotebookData["take_note"] = takeNote
          if(word) theoryNotebookData["word"] = word.trim()
          if(grammar) theoryNotebookData["grammar"] = grammar.trim()
          if(hanzii) theoryNotebookData["hanzii"] = hanzii.trim()
          const newTheoryNotebook = await this.theoryNotebookRepository.create(theoryNotebookData);
          if(newTheoryNotebook) idsTheorySuccess.push(newTheoryNotebook.theory_id)
          else idsTheoryFailed.push(newTheoryNotebook.theory_id)
        }
      }
      const dataResponse = {
        message: 'Create/Update theory notebook successfully',
        data: {
          idsTheorySuccess: idsTheorySuccess,
          idsTheoryFailed: idsTheoryFailed
        },
      };
      return dataResponse;
    } catch (error) {
      console.log(error)
      Sentry.captureException(error);
      if (error instanceof HttpException) {
        throw error; 
      }
      throw new HttpException(
        `Internal server error`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateNewTheoryNotebook(user_id: string, updateTheoryNotebookDto: any) {
    const {theoryId, takeNote, tick, understandLevel} = updateTheoryNotebookDto
    const findTheoryNotebookDetail = await this.theoryNotebookRepository.findByCondition({user_id: +user_id, theory_id: +theoryId})
    if(!findTheoryNotebookDetail) {
      throw new HttpException(
        `Notebook is not found.`,
        HttpStatus.NOT_FOUND,
      );
    }
    const theoryNotebookData = {};
    if(understandLevel) theoryNotebookData["understand_level"] = +understandLevel
    if(tick) theoryNotebookData["tick"] = +tick
    if(takeNote) theoryNotebookData["take_note"] = takeNote.trim()
    const updateTheoryNotebook = await this.theoryNotebookRepository.update(+findTheoryNotebookDetail.id, theoryNotebookData);
    return updateTheoryNotebook;
  }
}
