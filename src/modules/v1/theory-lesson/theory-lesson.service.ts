import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from "@sentry/node";
import { CreateTheoryLessonArrayDto, PaginateTheoryLessonFilterDto, TheoryVersiontDto } from './dtos/createTheoryLesson.dto';
import { TheoryLessonRepository } from './theory-lesson.reponsitory';
@Injectable()
export class TheoryLessonService {
  constructor(
    private readonly configService: ConfigService,
    private readonly theoryLessonRepository: TheoryLessonRepository,
  ) {}

  async getOptionTheoryLesson(user_id: string, paginateTheoryFilterDto: PaginateTheoryLessonFilterDto) {
    const {page, limit, level, kind} = paginateTheoryFilterDto
    try {
      let whereConditon: any = [
        {user_id: +user_id, level: +level, kind: kind}
      ]

      const allTheoryLessonOption = await this.theoryLessonRepository.findOption({
        where: whereConditon,
        order: {
          created_at: "DESC"
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      for(const tmp of allTheoryLessonOption) {
        tmp.created_at = new Date(tmp.created_at).getTime()
        tmp.updated_at = new Date(tmp.updated_at).getTime()
      }
      
      const dataResponse = {
        message: 'Get all theory lesson by option successfully',
        data: allTheoryLessonOption,
      };
      return dataResponse
    } catch (error) {
      console.log(error)
      // Sentry.captureException(error);
      // if (error instanceof HttpException) {
      //   throw error; 
      // }
      throw new HttpException(
        `Internal server error`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createNewTheoryLesson(user_id: string, data: CreateTheoryLessonArrayDto) {
    try {
      const idsTheorySuccess = []
      const idsTheoryFailed = []
      for(const input of data.theoryInput) {
        const {lessonId, completedStatus, level, kind} = input
        const findTheoryLessonDetail = await this.theoryLessonRepository.findByCondition({lesson_id: lessonId, user_id: +user_id, level: +level})
        if(findTheoryLessonDetail) {
          const checkSuccess = await this.updateNewTheoryLesson(user_id, input)
          if(checkSuccess?.affected) idsTheorySuccess.push(findTheoryLessonDetail.lesson_id)
          else idsTheoryFailed.push(findTheoryLessonDetail.lesson_id)
        }
        else {
          const theoryLessonData = {
            user_id: +user_id,
            lesson_id: lessonId,
            level: +level,
            kind: kind
          };
          if(completedStatus) theoryLessonData["completed_status"] = +completedStatus
          const newTheoryLesson = await this.theoryLessonRepository.create(theoryLessonData);
          if(newTheoryLesson) idsTheorySuccess.push(newTheoryLesson.lesson_id)
          else idsTheoryFailed.push(newTheoryLesson.lesson_id)
        }
      }
      const dataResponse = {
        message: 'Create/Update theory lesson successfully',
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

  async updateNewTheoryLesson(user_id: string, updateTheoryLessonDto: any) {
    const {lessonId, level, completedStatus} = updateTheoryLessonDto
    const findTheoryLessonDetail = await this.theoryLessonRepository.findByCondition({user_id: +user_id, lesson_id: lessonId, level: +level})
    if(!findTheoryLessonDetail) {
      throw new HttpException(
        `Lesson is not found.`,
        HttpStatus.NOT_FOUND,
      );
    }
    const theoryLessonData = {};
    if(completedStatus) theoryLessonData["completed_status"] = +completedStatus
    const updateTheoryLesson = await this.theoryLessonRepository.update(+findTheoryLessonDetail.id, theoryLessonData);
    return updateTheoryLesson;
  }

  async getTheoryVersion(theoryVersiontDto: TheoryVersiontDto) {
    const {language} = theoryVersiontDto
    const theoryLanguageRaw = await this.theoryLessonRepository.query(`select * from theory_version WHERE language = ?`, [language])
    return {
      message: "Get theory verison successfully !!!",
      data: theoryLanguageRaw[0]
    }
  }
}
