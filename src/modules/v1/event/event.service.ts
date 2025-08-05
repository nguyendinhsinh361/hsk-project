import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as path from 'path'
import { ConfigService } from '@nestjs/config';
const fileName = 'src/config/verified/google/api-5471876505635454505-5249-ae6fd8d08044.json'
const projectPath = process.cwd()
import { EventRepository } from './event.reponsitory';
import * as Sentry from "@sentry/node";
import { EventDetailDto, EventRequestDto, ExamEventDetailDto, RankingFilterDto, UpdateResultExamOnlineDto, UserFollowDto } from './dtos/event.dto';
import { PaginateDto } from 'src/common/dtos/paginate.dto';

@Injectable()
export class EventService {
    constructor(
        private readonly eventRepository: EventRepository,
    ) {}

    calculateResults(arr1: any, arr2: any) {
        return arr1.reduce((acc, item1) => {
            const item2 = arr2.find(item => item.id === item1.id);
            if (item2) {
                acc.totalCorrect += item1.correct.filter(isCorrect => isCorrect === 1).length;
                acc.totalQuestion += item2.scores.length;
                acc.totalScore += item1.correct
                    .map((isCorrect, index) => (isCorrect === 1 ? item2.scores[index] : 0))
                    .reduce((sum, score) => sum + score, 0);
            }
            return acc;
        }, { totalCorrect: 0, totalScore: 0, totalQuestion: 0 });
    }

    async getEventNewest() {
        try {
            const allEventTime = await this.eventRepository.getEventTimeNewest()
            const finEventTimeCurrent = allEventTime[0]
            const listEventCurrent = await this.eventRepository.findAll({
                where: {
                    // end: finEventTimeCurrent.end,
                    active: 1
                },
                take: 6,
                order: {
                    end: 'DESC'
                },
                select: ['event_id', 'level', 'kind', 'active'],
            })
            return listEventCurrent
        } catch (error) {
            Sentry.captureException(error);
        }
    }

    async getLatestTime() {
        try {
            const allEventTime = await this.eventRepository.getEventTimeNewest()
            const finEventTimeCurrent = allEventTime[0]
            return {
                timeStart: +finEventTimeCurrent.start,
                timeEnd: +finEventTimeCurrent.end
            }
        } catch (error) {
            throw new HttpException('Bad request', HttpStatus.BAD_REQUEST)
        }
    }

    async getListEvent(user_id: string, eventRequestDto: EventRequestDto) {
        try {
            const DOMAIN_EVENT = `https://admin-hsk.migii.net`
            const {language} = eventRequestDto
            const sqlNotHaveUser = `select event_id, kind, start, end, description, count_question, time, follower_count, 0 as is_following from event WHERE active = 1`
            const sqlHaveUser = ` select event_id, kind, start, end, description, count_question, time, follower_count, 
            (select count(user_id) from event_follow where user_id = ${+user_id} and event_id = e.event_id) as is_following from event as e WHERE active = 1`
            const sqlFinal = user_id ? sqlHaveUser : sqlNotHaveUser
            const eventListRaw = await this.eventRepository.query(sqlFinal)
            const time = Date.now();

            const eventList = eventListRaw.map((item) => {
                item["timeServer"] = time;

                if (item['start'] <= time && item['end'] >= time) {
                    item['status'] = 0;
                } else if (item['end'] > time) {
                    item['status'] = 1;
                } else {
                    item['status'] = 2;
                }
                return item
            });
            eventList.sort((a, b) => parseFloat(a.end) - parseFloat(b.end));

            const listEvents = eventList.map((item) => {
                item.start = +item.start
                item.end = +item.end
                item.is_following = +item.is_following
                let description = {}
                try {
                    description = JSON.parse(item['description']);
                } catch (e) {}
                const descriptionLanguage = description[language]

                item['image'] = !(descriptionLanguage && descriptionLanguage?.image.includes('http')) ? (descriptionLanguage ? DOMAIN_EVENT + descriptionLanguage?.image : null) : (descriptionLanguage && descriptionLanguage?.image ? descriptionLanguage?.image : null)
                item['title'] = (descriptionLanguage && descriptionLanguage?.title) ? descriptionLanguage?.title : null
            
                delete item['description'];
                return item;
            });
            return {
                message: "Get list event successfully !!!",
                data: listEvents,
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Bad request', HttpStatus.BAD_REQUEST)
        }
    }

    async getEventDetail(user_id: string, eventDetailDto: EventDetailDto) {
        try {
            const DOMAIN_EVENT = `https://admin-hsk.migii.net`
            const {event_id, language} = eventDetailDto
            const sqlNotHaveUser = `select event_id, kind, start, end, description, count_question, time, follower_count, 0 as is_following from event WHERE active = 1 and event_id = ${+event_id} order by created_at desc`
            const sqlHaveUser = ` select event_id, kind, start, end, description, count_question, time, follower_count, 
            (select count(user_id) from event_follow where user_id = ${+user_id} and event_id = e.event_id) as is_following from event as e WHERE active = 1 and event_id = ${+event_id} order by created_at desc`
            const sqlFinal = user_id ? sqlHaveUser : sqlNotHaveUser
            console.log(1111, sqlFinal)

            const eventDetailRaw = await this.eventRepository.query(sqlFinal)

            const eventTestDetailRaw = await this.eventRepository.query(`select test_id, time, score, pass_score, count_question from event_test WHERE active = 1 and event_id = ?`, [+event_id])

            const EVENT_ID_STONE = 85
            let sqlQuery = `select res.user_id, users.name ,res.work_time, res.result_score_total,res.score, res.created_at from event_test_result as res join users on users.id = res.user_id  WHERE res.event_id = ${+event_id}  order by res.result_score_total DESC, res.work_time ASC`
            if (+event_id > EVENT_ID_STONE) {
                sqlQuery = `select res.user_id, users.name ,res.work_time, res.result_score_total,res.score, res.created_at from event_test_result as res join users on users.id = res.user_id  WHERE res.event_id = ${+event_id}  order by res.result_score_total DESC, res.created_at ASC`
            }
            const rankingEventOnlineRaw = await this.eventRepository.query(sqlQuery)
            return {
                message: "Get event detail successfully !!!",
                data: {
                    ...eventDetailRaw.map(item => {
                        item.start = +item.start
                        item.end = +item.end
                        item.is_following = +item.is_following
                        let description = {}
                        try {
                            description = JSON.parse(item['description']);
                        } catch (e) {}
                        const descriptionLanguage = description[language]

                        item['image'] = !(descriptionLanguage && descriptionLanguage?.image.includes('http')) ? (descriptionLanguage ? DOMAIN_EVENT + descriptionLanguage?.image : null) : (descriptionLanguage && descriptionLanguage?.image ? descriptionLanguage?.image : null)
                        item['title'] = (descriptionLanguage && descriptionLanguage?.title) ? descriptionLanguage?.title : null
                    
                        delete item['description'];
                        return item
                    })[0],
                    test_id: +eventTestDetailRaw[0].test_id,
                    score: eventTestDetailRaw[0].score,
                    pass_score: eventTestDetailRaw[0].pass_score,
                    count_users: rankingEventOnlineRaw.length
                }
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Bad request', HttpStatus.BAD_REQUEST)
        }
    }

    async getExamForEventDetail(examEventDetailDto: ExamEventDetailDto) {
        try {
            const {exam_event_id} = examEventDetailDto
            const examEventDetailRaw = await this.eventRepository.query(`select test_id, time, score, pass_score, parts from event_test WHERE test_id = ?`, [+exam_event_id])
            const examEvent = examEventDetailRaw[0]
            return {
                message: "Get event detail successfully !!!",
                data: {
                    ...examEvent,
                    parts: JSON.parse(examEvent.parts)
                }
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Bad request', HttpStatus.BAD_REQUEST)
        }
    } 

    async getEventHistoryDetail(user_id: string, eventDetailDto: EventDetailDto) {
        try {
            const {event_id} = eventDetailDto
            const eventHistoryUser = await this.eventRepository.query(`select test_id, event_id, answer, result_score_total, result_score_parts, work_time, pass_score, time, score, correct_count_question, count_question, created_at from event_test_result WHERE event_id = ? and user_id = ? order by id desc`, [+event_id, +user_id])
            if(!eventHistoryUser.length) {
                throw new HttpException('Not found', HttpStatus.NOT_FOUND)
            }
            return {
                message: "Get event result history successfully !!!",
                data: eventHistoryUser.map(ele => {
                    return {
                        ...ele,
                        test_id: +ele.test_id,
                        event_id: +ele.event_id,
                        answer: JSON.parse(ele.answer),
                        result_score_total: +ele.result_score_total,
                        result_score_parts: JSON.parse(ele.result_score_parts),
                        work_time: +ele.work_time,
                        time: +ele.time,
                        score: +ele.score,
                        correct_count_question: +ele.correct_count_question,
                        count_question: +ele.count_question,
                    }
                })
            }
        } catch (error) {
            console.log(error)
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Bad request', HttpStatus.BAD_REQUEST)
        }
    }

    async getEventRankForUser(user_id: string, rankingFilterDto: RankingFilterDto) {
        try {
            const EVENT_ID_STONE = 85
            const {limit, page, event_id} = rankingFilterDto
            const offset = (page - 1) * limit;
            let sqlQuery = `select res.user_id, users.name ,res.work_time, res.result_score_total,res.score, res.created_at from event_test_result as res join users on users.id = res.user_id  WHERE res.event_id = ${+event_id}  order by res.result_score_total DESC, res.work_time ASC`
            if (+event_id > EVENT_ID_STONE) {
                sqlQuery = `select res.user_id, users.name ,res.work_time, res.result_score_total,res.score, res.created_at from event_test_result as res join users on users.id = res.user_id WHERE res.event_id = ${+event_id} order by res.result_score_total DESC, res.created_at ASC`
            }
            const rankingEventOnlineRaw = await this.eventRepository.query(sqlQuery)
            const rankingEventOnline = rankingEventOnlineRaw.reduce((acc, item) => {
                const key = `${item.user_id}-${item.event_id}`;
                if (!acc.seen.has(key)) {
                  acc.seen.add(key);
                  acc.result.push(item);
                }
                return acc;
              }, { seen: new Set(), result: [] }).result;
              
              rankingEventOnline.forEach((item, index) => {
                item.rank_index = index + 1;
              });
            const rankingEventOnlineFinal = rankingEventOnline.slice(offset, offset+limit);
            const findRankCurrentUser = rankingEventOnline.find(ele => +ele.user_id === +user_id)
            const rankingCurrentUser = findRankCurrentUser ? {
                user_id: +user_id, 
                name: findRankCurrentUser.name,
                work_time: findRankCurrentUser.work_time,
                result_score_total: findRankCurrentUser.result_score_total,
                score: findRankCurrentUser.score,
                created_at: findRankCurrentUser.created_at,
                rank_index: findRankCurrentUser.rank_index,
            } : {
                user_id: +user_id, 
                name: "", 
                work_time: 0,
                result_score_total: 0,
                score: 0,
                created_at: null,
                rank_index: 0,
            } 
            return {
                message: "Get ranking successfully !!!",
                data: {
                    current_user_ranking: rankingCurrentUser,
                    event_online_ranking: rankingEventOnlineFinal,
                }
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Bad request', HttpStatus.BAD_REQUEST)
        }
    }

    async updateResultForEvent(user_id: string, updateResultExamOnlineDto: UpdateResultExamOnlineDto) {
        try {
            const {test_id, event_id, answers, work_time} = updateResultExamOnlineDto
            const contentPartsEventDetailRaw = await this.eventRepository.query(`select score, pass_score, parts, time, count_question from event_test WHERE test_id = ${+test_id} limit 1`)
            const contentPartsEventDetail = JSON.parse(contentPartsEventDetailRaw[0].parts)
            const resultRaw = contentPartsEventDetail.map(p1 => {
                const scoresMapParts = p1.content.flatMap(p2 => {
                    return p2.Questions.map(c => {
                        return {
                            id: +c.id,
                            scores: c.scores
                        }
                    })
                })
                const calculateScores = this.calculateResults(answers, scoresMapParts)
                return {
                    name: p1.name,
                    ...calculateScores
                }
            })
            let totalCorrectFinal = 0
            let totalScoreFinal = 0
            let totalQuestionFinal = 0
            const resutlScoreParts = resultRaw.map(ele => {
                totalCorrectFinal += +ele.totalCorrect
                totalScoreFinal += +ele.totalScore
                totalQuestionFinal += +ele.totalQuestion
                return {
                    name: ele.name,
                    score: +ele.totalScore
                }
            })
            const sqlInsert = `INSERT INTO event_test_result (test_id, event_id, user_id, answer, result_score_total, result_score_parts, work_time, pass_score, time, score,correct_count_question, count_question) VALUES (${test_id}, ${event_id}, ${+user_id}, '${JSON.stringify(answers)}', ${totalScoreFinal}, '${JSON.stringify(resutlScoreParts)}', ${+work_time}, ${contentPartsEventDetailRaw[0]['pass_score']}, ${contentPartsEventDetailRaw[0]['time']}, ${contentPartsEventDetailRaw[0]['score']}, ${totalCorrectFinal}, ${totalQuestionFinal})`
            const checkInsertResultEvent = await this.eventRepository.query(sqlInsert)
            let rank_index = 0
            if (checkInsertResultEvent) {
                const getRankCurrentUser = await this.getEventRankForUser(user_id, {
                    page: 1, 
                    limit: 10,
                    event_id: event_id.toString()
                })
                rank_index = getRankCurrentUser.data.current_user_ranking.rank_index
            }
            const responseFinal = {
                result_score_total: totalScoreFinal, 
                result_score_parts: resutlScoreParts, 
                pass_score: contentPartsEventDetailRaw[0]['pass_score'], 
                score: contentPartsEventDetailRaw[0]['score'],
                rank_index: rank_index,
                correct_count_question: totalCorrectFinal,
                count_question: totalQuestionFinal
            }
            return {
                message: "Update result exam event online successfully !!!",
                data: responseFinal
            }
        } catch (error) {
            console.log(error)
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Bad request', HttpStatus.BAD_REQUEST)
        }
    }

    async updateFollowUser(user_id: string, userFollowDto: UserFollowDto) {
        try {
            const {event_id, follow} = userFollowDto
            if (follow) {
                const sqlFollow = `insert into event_follow set user_id = ${user_id}, event_id= ${event_id}`;
                const checkFollow = await this.eventRepository.query(sqlFollow)
                const countFollowEvent = `update event set follower_count = follower_count+1 where event_id = ${event_id}`
                if (checkFollow) await this.eventRepository.query(countFollowEvent)
                return {
                    message: "Update info user follow successfully !!!",
                    data: null
                }
            } 
            const sqlFollow = `delete from event_follow where user_id = ${user_id} and event_id= ${event_id}`;
            const checkFollow = await this.eventRepository.query(sqlFollow)
            const countFollowEvent = `update event set follower_count = follower_count-1 where event_id = ${event_id}`
            if (checkFollow && checkFollow.affectedRows) await this.eventRepository.query(countFollowEvent)
            return {
                message: "Update info user follow successfully !!!",
                data: null
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error; 
            }
            throw new HttpException('Bad request', HttpStatus.BAD_REQUEST)
        }
    }
}