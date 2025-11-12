export interface IJwtPayload {
  id: string;
  username: string;
  email?: string;
  crmAccessToken?: string;
  companyIdentifier?: string;
}

export interface IJwtUser extends IJwtPayload {
  iat: number;
  exp: number;
}
