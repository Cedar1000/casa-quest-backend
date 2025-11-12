import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './services/auth.services';
import { LoginDto } from './dto/login.dto';
import { CreateUserDTO } from '../user/dto/create-user.dto';
import { GetUser } from './get-user.decorator';
import { User } from '../user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(public authService: AuthService) {}

  @Post('signup/managers')
  managerSignup(@Body() body: CreateUserDTO) {
    return this.authService.managerSignup(body);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('login-crm')
  loginCrm(@Body() body: LoginDto, @Headers() headers) {
    const serverUrl = headers['x-crm-company'];
    return this.authService.login2(body, serverUrl.toUpperCase());
  }

  @Get('get-self')
  @UseGuards(AuthGuard())
  getProfile(@GetUser() user: User) {
    return user;
  }
}
