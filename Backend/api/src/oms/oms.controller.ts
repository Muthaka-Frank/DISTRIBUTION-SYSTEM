import { Controller, Post, Body } from '@nestjs/common';
import { OmsService } from './oms.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('oms')
export class OmsController {
  constructor(private readonly omsService: OmsService) {}

  @Post('orders')
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.omsService.createOrder(createOrderDto);
  }
}
