// src/utils/serverRequest.ts
import { AxiosRequestConfig } from 'axios';
import { NextRequest } from 'next/server';
import api from './axios';
import { getCookiesFromRequest } from './cookies';

export async function serverRequest(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  req: NextRequest,
  data?: any,
  config?: AxiosRequestConfig
) {
  const cookies = getCookiesFromRequest(req);

  // Merge headers to include cookies
  const requestConfig: AxiosRequestConfig = {
    ...config,
    headers: {
      ...config?.headers,
      Cookie: cookies,
    },
  };

  // Make the request with the specified method
  return api.request({
    method,
    url,
    data,
    ...requestConfig,
  });
}
