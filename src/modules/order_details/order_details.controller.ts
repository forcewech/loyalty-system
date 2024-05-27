import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ERoleType, USER } from 'src/constants';
import { AuthUser, Roles, UserGuard } from 'src/utils';
import { RolesGuard } from 'src/utils/guards/roles.guard';
import { CreateOrderDetailDto } from './dto/create-order_detail.dto';
import { OrderDetailsService } from './order_details.service';

@Controller('order-details')
export class OrderDetailsController {
  constructor(private readonly orderDetailsService: OrderDetailsService) {}

  @Post()
  @Roles(ERoleType.CLIENT)
  @UseGuards(UserGuard, RolesGuard)
  async create(@Body() createOrderDetailDto: CreateOrderDetailDto, @AuthUser() user) {
    await this.orderDetailsService.create(createOrderDetailDto, user);
    return { message: USER.PAYMENT_SUCCESS };
  }
}
