import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { WmsService } from './wms.service';
import { AddInventoryDto } from './dto/add-inventory.dto';

@Controller('wms')
export class WmsController {
  constructor(private readonly wmsService: WmsService) {}

  @Post('inventory')
  addInventory(@Body() dto: AddInventoryDto) {
    return this.wmsService.addInventory(dto);
  }

  @Get('inventory/:sku')
  checkStock(@Param('sku') sku: string) {
    return this.wmsService.checkStock(sku);
  }

  @Get('serialize/:sku/:batch')
  generateBarcode(@Param('sku') sku: string, @Param('batch') batch: string) {
    return { barcode: this.wmsService.generateBarcode(sku, batch) };
  }
}
