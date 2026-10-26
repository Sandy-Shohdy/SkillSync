import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { memoryStorage } from 'multer';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthedRequest, JwtAuthGuard } from '../auth/jwt-auth.guard';

// Kept under Vercel's 4.5 MB request body limit.
export const MAX_AVATAR_BYTES = 4 * 1024 * 1024;

// Raster formats only: SVG can carry scripts and is served from the API origin.
const ALLOWED_AVATAR_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

function toSafeUser(user: User) {
  const {
    passwordHash: _passwordHash,
    avatarData: _avatarData,
    avatarMimeType: _avatarMimeType,
    ...safeUser
  } = user;
  return safeUser;
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  @Get('me')
  async getMe(@Req() req: AuthedRequest) {
    const user = await this.findCurrentUser(req);
    return toSafeUser(user);
  }

  @Patch('me')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: memoryStorage(),
      fileFilter: (_req, file, callback) => {
        if (!ALLOWED_AVATAR_TYPES.includes(file.mimetype)) {
          callback(
            new BadRequestException(
              'Profile photo must be a JPEG, PNG, WebP or GIF image',
            ),
            false,
          );
          return;
        }
        callback(null, true);
      },
      limits: { fileSize: MAX_AVATAR_BYTES },
    }),
  )
  async updateMe(
    @Req() req: AuthedRequest,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    const user = await this.findCurrentUser(req);

    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.bio !== undefined) user.bio = dto.bio;
    if (dto.category !== undefined) user.category = dto.category;
    if (dto.pricePerHour !== undefined) user.pricePerHour = dto.pricePerHour;
    if (dto.skills !== undefined) user.skills = dto.skills;
    if (dto.location !== undefined) user.location = dto.location;
    if (avatar) {
      user.avatarData = avatar.buffer;
      user.avatarMimeType = avatar.mimetype;
      // Version query busts browser caches when the photo changes.
      user.avatarUrl = `/avatars/${user.id}?v=${Date.now()}`;
    }

    const saved = await this.usersRepository.save(user);
    return toSafeUser(saved);
  }

  private async findCurrentUser(req: AuthedRequest): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: req.user.sub },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
