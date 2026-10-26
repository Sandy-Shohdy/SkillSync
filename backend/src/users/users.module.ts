import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { FreelancersController } from './freelancers.controller';
import { AvatarsController } from './avatars.controller';
import { JwtConfigModule } from '../auth/jwt-config.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtConfigModule],
  controllers: [UsersController, FreelancersController, AvatarsController],
  exports: [TypeOrmModule],
})
export class UsersModule {}
