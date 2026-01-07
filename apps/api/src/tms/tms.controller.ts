import { Controller, Post, Body, Param, Patch } from '@nestjs/common';
import { TmsService } from './tms.service';
import { CreateShipmentDto, UpdateLocationDto } from './dto/tms.dto';

@Controller('tms')
export class TmsController {
    constructor(private readonly tmsService: TmsService) { }

    @Post('shipments')
    create(@Body() dto: CreateShipmentDto) {
        return this.tmsService.createShipment(dto);
    }

    @Patch('shipments/:id/location')
    updateLocation(@Param('id') id: string, @Body() dto: UpdateLocationDto) {
        return this.tmsService.updateLocation(id, dto);
    }

    @Post('shipments/:id/temperature')
    recordTemperature(
        @Param('id') id: string,
        @Body('temperature') temperature: number,
        @Body('sensorId') sensorId: string,
    ) {
        return this.tmsService.recordTemperature(id, temperature, sensorId);
    }
}
