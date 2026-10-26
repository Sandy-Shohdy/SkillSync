import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Res,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Controller('avatars')
export class AvatarsController {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  @Get(':userId')
  async getAvatar(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Res() res: Response,
  ) {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .select(['user.id'])
      .addSelect(['user.avatarData', 'user.avatarMimeType'])
      .where('user.id = :userId', { userId })
      .getOne();

    if (!user?.avatarData || !user.avatarMimeType) {
      throw new NotFoundException('Avatar not found');
    }

    res.set({
      'Content-Type': user.avatarMimeType,
      'Content-Length': String(user.avatarData.length),
      // avatarUrl carries a version query, so each photo URL is immutable.
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    });
    res.send(user.avatarData);
  }
}
