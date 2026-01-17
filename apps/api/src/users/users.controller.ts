import { Controller, Get, Post, Body, Delete, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, Prisma } from '@prisma/client';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @Roles(Role.ADMIN)
    create(@Body() createUserDto: Prisma.UserCreateInput) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @Roles(Role.ADMIN)
    findAll() {
        return this.usersService.findAll();
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    remove(@Param('id') id: string) {
        return this.usersService.remove(id);
    }
}
