import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { JwtConfigModule } from '../auth/jwt-config.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), JwtConfigModule],
  controllers: [UsersController],
  exports: [TypeOrmModule],
})
export class UsersModule {}
