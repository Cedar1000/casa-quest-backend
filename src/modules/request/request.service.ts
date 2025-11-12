import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { CRMBaseUrls } from 'src/common/constants/crm-server-urls';
import { axiosErrorHandler } from 'src/common/libs/axios-error-handler';

@Injectable()
export class RequestService {
  constructor(private httpService: HttpService) {}

  async get(companyIdentifier: string, token: string, path: string) {
    const serverUrl = CRMBaseUrls[companyIdentifier];
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await firstValueFrom(
      this.httpService.get(`${serverUrl}${path}`, { headers }).pipe(
        catchError((error) => {
          return axiosErrorHandler(error);
        }),
      ),
    );

    return response.data;
  }

  async post(
    companyIdentifier: string,
    path: string,
    payload: Object,
    token?: string,
  ) {
    const serverUrl = CRMBaseUrls[companyIdentifier];
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await firstValueFrom(
      this.httpService.post(`${serverUrl}${path}`, payload, { headers }).pipe(
        catchError((error) => {
          return axiosErrorHandler(error);
        }),
      ),
    );

    return response.data;
  }
}
