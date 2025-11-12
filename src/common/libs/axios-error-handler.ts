import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { AxiosError } from 'axios';

// TODO: Edge Case to handle: Handle case where user's crm token expires.
export const axiosErrorHandler = (error: any) => {
  const axiosError = error as AxiosError;
  if (!error.isAxiosError || !axiosError.response) {
    throw new InternalServerErrorException(
      error.message || 'An unknown error occurred',
    );
  }
  const { data } = axiosError.response;
  throw new UnauthorizedException(data);
};
