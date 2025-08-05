import { Injectable } from '@nestjs/common';
import { RoutesDefaultRepository } from './routes-default.repository'; 
import { RouteLevelEnum } from './enums/route-level.enum';

@Injectable()
export class RoutesDefaultService {
    constructor(private readonly routesDefaultRepository: RoutesDefaultRepository) {}
    
    async createNewRoutesDefault( routeData: any, routeLevel: number) {
        return await this.routesDefaultRepository.create({level: +routeLevel, route: JSON.stringify(routeData)})
    }

    async getDetailRoutesDefault(routeLevel: number) {
        return await this.routesDefaultRepository.findByCondition({level: +routeLevel})
    }

}