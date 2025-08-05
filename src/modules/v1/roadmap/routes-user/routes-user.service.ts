import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RoutesUserRepository } from './routes-user.reponsitory'; 
import { RoutesUserDetailDto, RoutesUserDto, RoutesUserResettDto, RoutesUserUpdateDto } from './dtos/routes-user.dto';
import { RoutesDefaultService } from '../routes-default/routes-default.service';
import { RouteLevelEnum } from '../routes-default/enums/route-level.enum';
import { Like } from 'typeorm';
import { QuestionsEvaluateLevelService } from '../question-evaluate-level/question-evaluate-level.service';
import { TypeRouteUserEnum } from '../../practice-writing/enums/kindQuestion.enum';

@Injectable()
export class RoutesUserService {
    constructor(
        private readonly routesUserRepository: RoutesUserRepository,
        private readonly routesDefaultService: RoutesDefaultService,
        private readonly questionsEvaluateLevelService: QuestionsEvaluateLevelService,
        
    ) {}
    
    async createNewRoutesUser(user_id: string, input: RoutesUserDto){
        const {level} = input
        const routeDefaultForLevel = await this.routesDefaultService.getDetailRoutesDefault(+level)
        if(!routeDefaultForLevel) throw new HttpException('Không có dữ liệu lộ trình', HttpStatus.NOT_FOUND)
        const checkRouteForLevelExist = await this.getDetailRouteLevelFromUser(user_id, level)
        if(checkRouteForLevelExist) throw new HttpException('Lộ trình đã tồn tại', HttpStatus.CONFLICT)
        return await this.routesUserRepository.create({id_user: +user_id, route: routeDefaultForLevel.route, level: +level})
    }

    async getDetailRouteLevelFromUser(user_id: string, routeLevel: RouteLevelEnum) {
        return await this.routesUserRepository.findByCondition({id_user: +user_id, level: +routeLevel})
    }

    updateDataRouteStatus(data) {
        for (let routeIndex = 0; routeIndex < data.length; routeIndex++) {
            const route = data[routeIndex];
            
            for (let detailIndex = 0; detailIndex < route.detail.length; detailIndex++) {
                const detail = route.detail[detailIndex];
                
                // Kiểm tra xem detail này có phải là phần tử cuối cùng không
                const isLastDetail = detailIndex === route.detail.length - 1;
                
                // Kiểm tra status của detail và process
                const hasAllProcessTrue = detail.process.every(process => process.status === true);
                const isDetailStatusFalse = detail.status === false;
                
                if (hasAllProcessTrue && isDetailStatusFalse) {
                    if (isLastDetail) {
                        // Update status của route
                        route.status = true;
                                        
                        // Update status của detail cuối cùng
                        detail.status = true;
                    }
                    else {
                        // Update status của detail
                        detail.status = true;
                    }
                }
            }
        }
        
        return null;
    }

    async getDetailNewestRouteLevelFromUser(user_id: string, input: RoutesUserDetailDto) {
        const {level} = input
        const newestRouteLevel = await this.routesUserRepository.findAll({
            where : {
                id_user: +user_id, 
                level: Like(`${level}%`)
            }, 
            order: {
                updated_at: 'DESC',
            }
        })
        if(!newestRouteLevel.length) throw new HttpException('Không có dữ liệu lộ trình', HttpStatus.NOT_FOUND)
        const allRouteLevelForUser = await this.routesUserRepository.findAll({
            where: {
                id_user: +user_id, 
                level: Like(`${level}%`),
            },
            select: ['id', 'created_at', 'updated_at'],
          });
        const idsRouteOldToDelete = (
            allRouteLevelForUser
            .filter(ele => ele.id != newestRouteLevel[0].id))
            .filter(ele => new Date(ele.created_at).getTime() == new Date(ele.updated_at).getTime()
        )
        if(idsRouteOldToDelete.length) {
            await this.routesUserRepository.deleteMultiple(idsRouteOldToDelete.map(ele => ele.id))
        }
        const currentRoute = JSON.parse(newestRouteLevel[0].route)
        this.updateDataRouteStatus(currentRoute.route)
        await this.routesUserRepository.update(+newestRouteLevel[0].id, {route: JSON.stringify(currentRoute)})
        const result = {...newestRouteLevel[0], route: currentRoute}
        return result
    }

    getRouteIndex(data, id_route) {
        return data.route.findIndex(route => route.id_route === id_route);
    }

    getDetailIndex(data, routeIndex, id_day) {
        if (routeIndex < 0 || routeIndex >= data.route.length) {
          return -1; // Route không hợp lệ
        }
        return data.route[routeIndex].detail.findIndex(detail => detail.id_day === id_day);
    }

    getProcessIndex(data, routeIndex, detailIndex, id_process) {
        if (
          routeIndex < 0 ||
          routeIndex >= data.route.length ||
          detailIndex < 0 ||
          detailIndex >= data.route[routeIndex].detail.length
        ) {
          return -1; // Route hoặc Detail không hợp lệ
        }
        return data.route[routeIndex].detail[detailIndex].process.findIndex(process => process.id_process === id_process);
    }

    async updateResultPracticeForRouteUser(user_id: string, input: RoutesUserUpdateDto) {
        const {id, id_route, id_day, id_process, result} = input
        const currentRouteForUser = await this.routesUserRepository.findByCondition({id: +id, id_user: +user_id})
        const currentRouteForUserData = JSON.parse(currentRouteForUser.route)

        const index_route = this.getRouteIndex(currentRouteForUserData, id_route)
        const index_day = this.getDetailIndex(currentRouteForUserData, index_route, id_day)
        const index_process = this.getProcessIndex(currentRouteForUserData, index_route, index_day, id_process)

        const currentRouteForUserDataValue = currentRouteForUserData.route
        const currentRoute = currentRouteForUserDataValue[index_route]
        const currentRouteDetail = currentRouteForUserDataValue[index_route].detail[index_day]
        const currentRouteDetailProcess = currentRouteForUserDataValue[index_route].detail[index_day].process[index_process]
        const currentRouteDetailCountDay = currentRouteForUserDataValue[index_route].count_day
        const checkDayHasTypeEvaluate = currentRouteForUserDataValue[index_route].count_day % 2 === (index_day+1) % 2
        if(!currentRouteDetailProcess.hasOwnProperty("result")) currentRouteDetailProcess["result"] = result
        else {
            currentRouteDetailProcess.result.time_end_process = result.time_end_process
            currentRouteDetailProcess.result.questions.push(...result.questions)
        }
        if(result.type === TypeRouteUserEnum.TEST || +currentRouteDetailProcess.result.questions.length >= +currentRouteDetailProcess.practice_per_day) currentRouteDetailProcess.status = true
        currentRouteDetail.process[index_process] = currentRouteDetailProcess

        if(result.type === TypeRouteUserEnum.TEST || (currentRouteDetailProcess.status && checkDayHasTypeEvaluate && currentRouteDetail.process.length === id_process) || (currentRouteDetailProcess.status && currentRouteDetail.process.length === 1)) currentRouteDetail.status = true
        currentRoute.detail[index_day] = currentRouteDetail

        if(result.type === TypeRouteUserEnum.TEST || (currentRouteDetail.status && +currentRouteDetailCountDay === index_day+1)) currentRoute.status = true
        currentRouteForUserDataValue[index_route] = currentRoute

        const routeUpdateDetail = {
            ...currentRouteForUserData,
            route: currentRouteForUserDataValue
        }
        await this.routesUserRepository.update(+id, {route: JSON.stringify(routeUpdateDetail)})
        const updateRouteForUser = await this.routesUserRepository.findByCondition({id: +id, id_user: +user_id}) 
        delete updateRouteForUser.backup
        return {
            isPassRouteDetailProcess: currentRouteDetailProcess.status,
            isPassRouteDetail: currentRouteDetail.status,
            isPassRoute: currentRoute.status,
            updateRouteForUser: {...updateRouteForUser, route: JSON.parse(updateRouteForUser.route)}
        }
    }

    async resetRouteFromIndexRoute(user_id: string, input: RoutesUserResettDto) {
        const {id, index_route} = input
        const currentRouteForUser = await this.routesUserRepository.findByCondition({id: +id, id_user: +user_id})
        const currentRouteForUserData = JSON.parse(currentRouteForUser.route)
        const currentRouteForUserDataValue = currentRouteForUserData.route

        const routeDefault = await this.routesDefaultService.getDetailRoutesDefault(+currentRouteForUser.level)
        const routeDefaultData = JSON.parse(routeDefault.route)
        const routeDefaultDataValue = routeDefaultData.route
        const currentRoute = currentRouteForUserDataValue[index_route]
        const updateOtherRouteForNew = routeDefaultDataValue.filter((ele, index) => +index >= +index_route)
        const resetRoute = {
            ...currentRouteForUserData,
            route: [...currentRoute, ...updateOtherRouteForNew] 
        }

        await this.routesUserRepository.update(+id, {route: JSON.stringify(resetRoute)})
        const updateRouteForUser = await this.routesUserRepository.findByCondition({id: +id, id_user: +user_id}) 
        delete updateRouteForUser.backup
        return updateRouteForUser
    }

    async deleteRouteUser(user_id: string, id: string) {
        const checkRouteUserExist = await this.routesUserRepository.findByCondition({id: +id, id_user: +user_id})
        if(!checkRouteUserExist) throw new HttpException('Lộ trình không tồn tại', HttpStatus.NOT_FOUND)
        return await this.routesUserRepository.delete(+id)
    }
}