import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ProcessActionDto } from './dto/process-action.dto';

@Controller('users')
@UseInterceptors(ClassSerializerInterceptor) // скрывает поля с @Exclude()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto.name, dto.balance ?? 0);
  }

  @Get()
  async getAllUser() {
    return this.usersService.getAllUsers();
  }

  @Get(':id')
  async getUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUser(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }

  @Post(':id/action')
  async processAction(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ProcessActionDto,
  ) {
    return this.usersService.processAction(id, dto.amount, dto.action);
  }
}
