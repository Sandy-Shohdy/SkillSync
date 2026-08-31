import { Injectable } from '@nestjs/common';
import { Service } from './interfaces/service.interface';
import { SERVICES } from './services.data';

@Injectable()
export class ServicesService {
  findAll(): Service[] {
    return SERVICES;
  }

  findOne(id: string): Service | undefined {
    return SERVICES.find((service) => service.id === id);
  }
}
