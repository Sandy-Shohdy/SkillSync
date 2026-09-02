import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';

function toPublicFreelancer(user: User) {
  return {
    id: user.id,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl ?? null,
    category: user.category ?? null,
    pricePerHour: user.pricePerHour ?? null,
    bio: user.bio ?? null,
    skills: user.skills ?? null,
    createdAt: user.createdAt,
  };
}

@Controller('freelancers')
export class FreelancersController {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  @Get()
  async findAll() {
    const freelancers = await this.usersRepository.find({
      where: { role: UserRole.FREELANCER },
      order: { createdAt: 'DESC' },
    });
    return freelancers.map(toPublicFreelancer);
  }
}
