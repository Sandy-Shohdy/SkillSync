import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ServicesService } from './services.service';
import { Service } from './interfaces/service.interface';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  findAll(): Service[] {
    return this.servicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Service {
    const service = this.servicesService.findOne(id);
    if (!service) {
      throw new NotFoundException(`Service ${id} not found`);
    }
    return service;
  }
}
