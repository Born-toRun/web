import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { deleteCookie, getCookie, setCookie } from 'cookies-next';
import { refreshToken } from './auth';
import HttpError from './httpError';

export const ACCESS_TOKEN = 'access_token';

export const SSR_BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1`;
export const CSR_BASE_URL = '/api/v1/';
const isServer = typeof window === 'undefined';

// 토큰 재발급을 한 번만 시도합니다. (무제한 재 요청을 방지)
type CustomAxiosRequestConfig = {
  _retry?: boolean;
} & AxiosRequestConfig;

export const api = axios.create({
  baseURL: isServer ? SSR_BASE_URL : CSR_BASE_URL,
});

api.interceptors.request.use(
  async (config) => {
    const beforeAccessToken = getCookie(ACCESS_TOKEN);

    if (beforeAccessToken) {
      config.headers.Authorization = `Bearer ${beforeAccessToken}`;
    }
    return config;
  },
  (error) => {
    if (error instanceof AxiosError) {
      const { response } = error;
      const httpError = new HttpError(response?.status, response?.statusText).errorData;
      throw httpError;
    }
    throw new Error('네트워크 통신 에러 발생');
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const beforeAccessToken = getCookie(ACCESS_TOKEN);

    if (!(error instanceof AxiosError)) throw new Error('네트워크 통신 에러 발생');

    const originRequest = error.config as CustomAxiosRequestConfig;
    const httpError = new HttpError(error.response?.status, error.response?.statusText).errorData;
    if (
      originRequest &&
      error.response &&
      beforeAccessToken &&
      !originRequest._retry &&
      error.response.status === 401
    ) {
      originRequest._retry = true;
      deleteCookie(ACCESS_TOKEN);

      try {
        const { jwt } = await refreshToken(beforeAccessToken);
        if (!jwt) {
          throw new HttpError(401, '재 로그인이 필요합니다.');
        }
        setCookie(ACCESS_TOKEN, jwt);
        originRequest._retry = false;
        const newHeaders = {
          ...originRequest.headers,
          Authorization: `Bearer ${jwt}`,
        };

        // 원래 요청을 새 엑세스 토큰으로 재시도
        return api({
          ...originRequest,
          headers: newHeaders,
        });
      } catch (error) {
        originRequest._retry = false;
        if (error instanceof AxiosError) {
          const { response } = error;
          const errorCode = response?.data;
          throw new HttpError(errorCode.errorCode, error.toString()).errorData;
        }
        throw new HttpError(401, '올바르지 않는 사용자입니다.');
      }
    }
    throw httpError;
  }
);
