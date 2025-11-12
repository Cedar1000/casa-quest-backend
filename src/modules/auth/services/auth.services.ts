import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto/login.dto';
import { HashingService } from 'src/common/libs/hashing';
import { IJwtPayload, IJwtUser } from '../types/jwt.types';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/modules/user/services/user.service';
import { CreateUserDTO } from 'src/modules/user/dto/create-user.dto';
import { CompanyService } from 'src/modules/company/services/company.service';
import { CRMBaseUrls } from '../../../common/constants/crm-server-urls';

import { UserRoles } from 'src/modules/user/enums/user.enum';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { User } from 'src/modules/user/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosError, AxiosResponse } from 'axios';
import { axiosErrorHandler } from 'src/common/libs/axios-error-handler';
import { RequestService } from 'src/modules/request/request.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly companyService: CompanyService,
    private jwtService: JwtService,
    @Inject(HashingService)
    private hashingService: HashingService,
    private configService: ConfigService,
    @Inject(HttpService)
    private readonly httpService: HttpService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private requestService: RequestService,
  ) {}

  async managerSignup(payload: CreateUserDTO) {
    const newCompany = await this.companyService.createOne(
      undefined,
      payload.company,
    );
    const userPayload = { ...payload };
    userPayload.role = UserRoles.Manager;
    userPayload.company = newCompany;

    return await this.userService.signup(userPayload);
  }

  async login(payload: LoginDto) {
    const user = await this.userService.findOne({
      where: {
        username: payload.username,
      },
    });

    if (!user) {
      throw new NotFoundException('User not Found');
    }

    const passwordIsValid = await this.hashingService.compare(
      payload.password,
      user.password,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException('Invalid Password');
    }

    const accessToken = this.issueToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

  async login2(payload: LoginDto, companyIdentifier: string) {
    const loginResponse = await this.requestService.post(
      companyIdentifier,
      'auth/login',
      payload,
    );

    // create user after successful login
    const userData = {
      id: loginResponse.id,
      username: loginResponse.username,
      role: loginResponse.role,
      accessToken: loginResponse.accessToken,
      companyName: companyIdentifier.toLowerCase(),
    };
    let foundUser = await this.userRepo.findOne({
      where: { id: userData.id },
    });
    if (!foundUser) {
      foundUser = await this.userRepo.create(userData);
      await this.userRepo.save(foundUser);
    } else {
      foundUser.accessToken = userData.accessToken;
      await this.userRepo.save(foundUser);
    }

    const accessToken = this.issueToken({
      id: foundUser.id,
      username: foundUser.username,
      crmAccessToken: userData.accessToken,
      companyIdentifier,
    });

    return {
      accessToken,
      user: {
        id: foundUser.id,
        username: foundUser.username,
        role: foundUser.role,
      },
    };
  }

  async verify(payload: string): Promise<IJwtUser> {
    return await this.jwtService.verify(payload, {
      secret: this.configService.get('JWT_SECRET'),
    });
  }

  private issueToken(payload: IJwtPayload) {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
    });
  }
}
