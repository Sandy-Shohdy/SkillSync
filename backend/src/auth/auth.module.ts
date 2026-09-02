import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { JwtConfigModule } from './jwt-config.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UsersModule, JwtConfigModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
