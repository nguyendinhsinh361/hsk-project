import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SupperPasswordKeyEntity } from "./entities/supper-password-key.entity";
import { SupperPasswordKeyRepository } from "./supper-password-key.reponsitory";

@Module({
  imports: [
    TypeOrmModule.forFeature([SupperPasswordKeyEntity]),
  ],
  controllers: [],
  providers: [SupperPasswordKeyRepository],
  exports: [SupperPasswordKeyRepository]
})
export class SupperPasswordKeyModule {}