import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserSynchronizedPracticeRepository } from '../users-synchronized-practice/users-synchronized-practice.reponsitory';
import { AccountRepository } from '../user/account/account.repository';
import { WrapupRepository } from './repo/wrapup.repository';
import { SUPPER_KEY } from '../../../middleware/supper-key.middleware';
import { IResponse } from '../../../common/interfaces/response.interface';
import * as Sentry from "@sentry/node";
import { MissionOptionDto, PaginateRankingFilterDto, SynchronizeMissionsUsersArrayDto } from './dtos/wrapup.dto';
import { KIND_MAPPING, KIND_HSKK_FREE, KIND_LISTENING_FREE, KIND_READING_FREE, KIND_DEFAULT, KIND_WRITING_PREMIUM, KIND_READING_PREMIUM, KIND_LISTENING_PREMIUM, KIND_MIA_PREMIUM} from '../../../common/constants/constant';
import { PurchaseService } from '../purchase/purchase.service';
import { MissionsUsersRepository } from './repo/mission-user.repository';
import { RankingRepository } from './repo/ranking.repository';
// import { CacheService } from 'src/modules/cache/cache.service';

@Injectable()
export class WrapUpService {
    constructor(
        private readonly accountRepository: AccountRepository,
        private readonly userSynchronizedPracticeRepository: UserSynchronizedPracticeRepository,
        private readonly wrapupRepository: WrapupRepository,
        private readonly missionsUsersRepository: MissionsUsersRepository,
        private readonly rankingRepository: RankingRepository,
        private readonly purchaseService: PurchaseService,
        // private readonly cacheService: CacheService
    ) {}

    async getInfoWrapUp(user_id: string) {
        try {
            const infoLoginFirst = await this.accountRepository.query("select created_at from users where id = ?", [+user_id])
            const infoHistoryUser = await this.userSynchronizedPracticeRepository.query("select * from users_synchronized_practice where user_id = ?", [+user_id])
            const totalQuestionPraticeUser = infoHistoryUser.filter(ele => ele.sync_type === "practice").map(ele => {
                const resultTmp = JSON.parse(ele.result)
                return resultTmp.total
            }).reduce((a, b) => a + b, 0)
            const infoHistoryUserForTest = infoHistoryUser.filter(ele => ele.sync_type === "test")
            const listExamScoreForUser = infoHistoryUserForTest.map(ele => {
                const resultTmp = JSON.parse(ele.result)
                let score = 0
                if (resultTmp.hasOwnProperty("scoreReading")) score += +resultTmp.scoreReading
                if (resultTmp.hasOwnProperty("scoreListening")) score += +resultTmp.scoreListening
                if (resultTmp.hasOwnProperty("scoreWriting")) score += +resultTmp.scoreWriting
                return score
            })
            const highestTestScore = Math.max(...listExamScoreForUser);

            const infoExamOnline = await this.userSynchronizedPracticeRepository.query("select count(*) as total from event_test_result where user_id = ?", [+user_id])
            const infoInTopUser = await this.userSynchronizedPracticeRepository.query("select count(*) as total from event_prize where user_id = ?", [+user_id])
            const wrapUpForUser = {
                infoLoginStartTime: infoLoginFirst[0].created_at,
                infoTotalExam: infoHistoryUserForTest.length,
                infoHighestTestScore: highestTestScore ? highestTestScore : 0,
                infoTotalQuestionPractice: totalQuestionPraticeUser ? totalQuestionPraticeUser : 0,
                infoTotalExamOnline: +infoExamOnline[0].total,
                infoInTopUser: +infoInTopUser[0].total
            }
            return wrapUpForUser
        } catch (error) {
            throw new HttpException('Bad request', HttpStatus.BAD_REQUEST)
        }
    }

    getTimeSlotTimestamps() {
        const currentTime = new Date();
        const startHour = currentTime.getHours() < 8 ? 0 : currentTime.getHours() < 16 ? 8 : 16;
        const endHour = startHour === 16 ? 0 : startHour + 8;
    
        const year = currentTime.getFullYear();
        const month = currentTime.getMonth();
        const date = currentTime.getDate();
    
        const timeStart = new Date(year, month, date, startHour, 0, 0).getTime();
        const timeEnd = new Date(year, month, date + (endHour === 0 ? 1 : 0), endHour, 0, 0).getTime();
    
        return { time_start: timeStart, time_end: timeEnd };
    }

    getAllIdKindsFree(kindFree: any) {
        const allKindsNested = Object.values(kindFree);
        const allKinds = allKindsNested.flat();
        return allKinds;
    }

    getRandomKindForCustom(level, type, code) {
        const MISSION_TYPE = ["free", "premium", "mia"]
        if(code.includes("theory")) return "theory"
        let kindData = KIND_DEFAULT
        if(type === MISSION_TYPE[0]) {
            kindData = code.includes("listening") ? KIND_LISTENING_FREE : (code.includes("reading") ? KIND_READING_FREE : (code.includes("hskk") ? KIND_HSKK_FREE : KIND_DEFAULT))
        } else if(type === MISSION_TYPE[1]){
            kindData = code.includes("listening") ? KIND_LISTENING_PREMIUM : (code.includes("reading") ? KIND_READING_PREMIUM : (code.includes("writing") ? KIND_WRITING_PREMIUM : ((code.includes("hskk") ? KIND_HSKK_FREE : KIND_DEFAULT))))
        } else {
            kindData = KIND_MIA_PREMIUM
        }

        if (!kindData.hasOwnProperty(level)) {
            // console.warn(`Level ${level} không tồn tại trong KIND_FREE.`);
            return "other"
        }

        const kindList = kindData[level];

        if (!Array.isArray(kindList) || kindList.length === 0) {
            // console.warn(`Không có idKind nào cho Level ${level}.`);
            return "other"
        }
    
        const randomIndex = Math.floor(Math.random() * kindList.length);
        
        return kindList[randomIndex];
    }

    getKindValue(kind: string) {
        if (KIND_MAPPING.hasOwnProperty(kind)) {
            return KIND_MAPPING[kind];
        } else {
            return null
        }
    }

    async getMission(user_id: string, missionOptionDto: MissionOptionDto){
        const {level} = missionOptionDto
        const MISSION_HANZII = ["theory_chinese_character_unit1", "theory_chinese_character"]
        const MISSION_RANDOM_COUNT_QUESTION = ["practice_reading_free", "practice_listening_free", "practice_writing_free", "practice_reading_premium", "practice_listening_premium", "practice_writing_premium"]
        try {
            const missionOverLimitRaw = await this.wrapupRepository.query(`SELECT id, mission_number FROM missions WHERE mission_number IS NOT NULL`)
            const missionOverLimit = missionOverLimitRaw.map(ele => {
                return {
                    mission_id: +ele.id,
                    mission_number: +ele.mission_number,
                }
            })
            const missionStatisticalUserRaw = await this.wrapupRepository.query(`SELECT user_id, mission_id, COUNT(*) as total_appear FROM missions_users WHERE user_id = ? GROUP BY user_id, mission_id`, [+user_id])
            const missionStatisticalUser = missionStatisticalUserRaw.map(ele => {
                return {
                    mission_id: +ele.mission_id,
                    mission_number: +ele.total_appear,
                }
            })
            const missionIdsNotIn = missionStatisticalUser
                .filter(bItem => 
                    missionOverLimit.some(aItem => 
                        bItem.mission_id === aItem.mission_id && 
                        bItem.mission_number >= aItem.mission_number
                    )
                )
                .map(item => item.mission_id);

            const missionTime = this.getTimeSlotTimestamps()
            const missionUserCurrentTime = await this.wrapupRepository.query(`SELECT * FROM missions_users WHERE user_id = ? AND time_start = ? AND time_end = ? AND mission_level = ? ORDER BY mission_type ASC LIMIT 3`, [+user_id, +missionTime.time_start, +missionTime.time_end, +level])

            if (missionUserCurrentTime.length) {
                return {
                    missisons: missionUserCurrentTime.map(ele => {
                        return {
                            ...ele,
                            time_start: +ele.time_start,
                            time_end: +ele.time_end
                        }
                    }),
                    ...missionTime
                }
            }
            const mission_hanzii = [1,2].includes(+level) ? "AND mission_code not in ('hskk_practice_free', 'hskk_exam_free', 'hskk_practice_premium', 'practice_writing_free', 'practice_writing_premium', 'practice_writing_mia')" : `AND mission_code not in ('theory_chinese_character_unit1', 'theory_chinese_character')`
            const queryIdsNotIn = missionIdsNotIn.length ? `AND id not in (${missionIdsNotIn.join(", ")}) ${mission_hanzii}` : `${mission_hanzii}`
            const missionQuery = queryIdsNotIn ? `
                (SELECT * FROM missions WHERE type = 'free' ${queryIdsNotIn} ORDER BY RAND() LIMIT 2)
                UNION ALL
                (SELECT * FROM missions WHERE type IN ('premium', 'mia') ${queryIdsNotIn} ORDER BY RAND() LIMIT 1)`:
                `(SELECT * FROM missions WHERE type = 'free' ORDER BY RAND() LIMIT 2)
                UNION ALL
                (SELECT * FROM missions WHERE type IN ('premium', 'mia') ORDER BY RAND() LIMIT 1)`
            // const missionQuery = `SELECT * FROM missions`
            const missionResultRaw = await this.wrapupRepository.query(missionQuery)
            const missionResult = missionResultRaw.map(ele => {
                const missionLevel = +level
                const missionCount = MISSION_RANDOM_COUNT_QUESTION.includes(ele.mission_code) ? Math.floor(Math.random() * 5) + 1 : 1
                const missionKind = this.getRandomKindForCustom(missionLevel, ele.type, ele.mission_code)
                const missionDisplay = ele.mission_display.replace("[số lượng]", `${missionCount}`).replace("[dạng bài]", this.getKindValue(missionKind)).replace("[xyz]", this.getKindValue(missionKind))
                return {
                    user_id: +user_id,
                    mission_id: ele.id,
                    mission_name: ele.mission,
                    mission_display: missionDisplay,
                    mission_code: ele.mission_code,
                    mission_kind: missionKind,
                    mission_type: ele.type,
                    mission_level: missionLevel,
                    mission_count: missionCount,
                    mission_progress: 0,
                    mission_point: ele.mission_point ? +ele?.mission_point : 1,
                    ...missionTime,
                }
            })
            const dataMissionUserSave = await this.missionsUsersRepository.create(missionResult)

            return {
                missisons: dataMissionUserSave.map(ele => {
                    return {
                        ...ele,
                        ...missionTime
                    }
                }),
                ...missionTime
            }
        } catch (error) {
            console.log(error)
            const response: IResponse = {
                message: "Get mission for user failed.",
                data: null
            }
            throw new HttpException(response, HttpStatus.BAD_REQUEST)   
        }
    }

    async updateDataMission(user_id: string, synchronizeMissionsUsersArrayDto: SynchronizeMissionsUsersArrayDto) {
        try {
            const {synchronizedMission} = synchronizeMissionsUsersArrayDto
            for(const input of synchronizedMission) {
                await this.missionsUsersRepository.query(`UPDATE missions_users SET mission_progress = mission_progress + ? WHERE id = ?`, [+input.mission_progress, +input.id])
            }
            const currentUser = await this.accountRepository.findOneById(user_id)
            const calculateFinalScore = await this.missionsUsersRepository.query("SELECT SUM(mission_point) as total_scores, COUNT(*) as total_missions FROM missions_users WHERE user_id = ? AND mission_count <= mission_progress", [+user_id])
            const {total_scores, total_missions} = calculateFinalScore[0]
            await this.missionsUsersRepository.query("INSERT INTO ranking (user_id, total_scores, total_missions, email, name) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE total_scores = ?, total_missions = ?", [+user_id, +total_scores, +total_missions, currentUser.email, currentUser.name, +total_scores, +total_missions])
            const missionDataUpdate = await this.missionsUsersRepository.query("SELECT * FROM missions_users WHERE user_id = ? AND id IN (?)", [+user_id, synchronizedMission.map(ele => +ele.id)])
            return {
                message: "Update missions_users successfully !!!",
                data: missionDataUpdate
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error; 
            }
            const response: IResponse = {
                message: "Update missions_users failed.",
                data: null
            }
            throw new HttpException(response, HttpStatus.BAD_REQUEST)  
        }
    }

    async addDataMission(file: any) {
        const jsonData = JSON.parse(file.buffer.toString('utf-8')); 
        const resultFinal = jsonData.map(ele => {
            return {
                ...ele,
                mission_number: ele.mission_number ? +ele.mission_number : null,
                mission_point: ele.mission_point ? +ele.mission_point : null,
                type: ele.type.toLowerCase()
            }
        })
        const dataSave = await this.wrapupRepository.create(resultFinal)
        return dataSave
    }

    async addDataRanking(file: any) {
        const jsonData = JSON.parse(file.buffer.toString('utf-8')); 
        const dataSave = await this.rankingRepository.create(jsonData)
        return dataSave
    }

    async deleteWrapupMissions(key_use: string) {
        if(key_use !== SUPPER_KEY[0].key_use) return null
        await this.wrapupRepository.query(`DELETE FROM ranking;`)
        await this.wrapupRepository.query(`DELETE FROM missions;`)
        await this.wrapupRepository.query(`DELETE FROM missions_users;`)
        return "Success !!!"
    }

    async getRanking(user_id: string, paginateRankingFilterDto: PaginateRankingFilterDto) {
        const {limit, page} = paginateRankingFilterDto
        const offset = (page - 1) * limit;

        const allRankingsRaw = await this.wrapupRepository.query(`SELECT user_id, total_scores, name FROM ranking ORDER BY total_scores DESC, updated_at ASC LIMIT ? OFFSET ?`, [+limit, offset]);
        const allRankings = allRankingsRaw.map((ele, index) => {
            return {
                ...ele,
                rank: index+offset+1
            }
        })
        const currentUserRankingRaw = await this.wrapupRepository.query(`
            SELECT COUNT(*) + 1 AS ranking
            FROM ranking r1
            WHERE 
            r1.total_scores > (SELECT total_scores FROM ranking WHERE user_id = ?)
            OR (
                r1.total_scores = (SELECT total_scores FROM ranking WHERE user_id = ?)
                AND r1.updated_at < (SELECT updated_at FROM ranking WHERE user_id = ?)
        )`, [+user_id, +user_id, +user_id])

        const currentUserInfo = await this.wrapupRepository.query(`SELECT user_id, total_scores FROM ranking WHERE user_id = ?`, [[+user_id]]);
        const currentUserRanking = currentUserInfo.length ? {
            ...currentUserInfo[0],
            rank: +currentUserRankingRaw[0].ranking
        } : {
            user_id: +user_id,
            total_scores: 0,
            rank: null
        }

        return {
            overall_ranking: allRankings,
            current_user_ranking: currentUserRanking,
        };
    }
}