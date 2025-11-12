export type ExceptionType = {
  code?: string | number;
  response?: {
    message: string;
  };
  status: number;
  detail: string;
};
