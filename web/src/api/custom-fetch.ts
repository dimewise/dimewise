import Axios, { AxiosRequestConfig } from 'axios';

const AXIOS_INSTANCE = Axios.create({
  baseURL: 'http://localhost:3001/api/v1/',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

export const DimewiseCustomFetcher = async<T>(config: AxiosRequestConfig): Promise<T> => {
  const promise = AXIOS_INSTANCE({ ...config })
    .then(({ data }) => data)
    .catch((error) => {
      if (error.response) {
        return Promise.reject(error.response.data);
      }
    });
  return promise;
};
export default DimewiseCustomFetcher;

export const getDimewiseToken = (): string => {
  return AXIOS_INSTANCE.defaults.headers.common.Authorization?.toString() ?? "";
}

export const setDimewiseToken = (token: string) => {
  if (token.length > 0) {
    AXIOS_INSTANCE.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete AXIOS_INSTANCE.defaults.headers.common.Authorization;
  }
};

AXIOS_INSTANCE.interceptors.request.use((config) => {
  if (config.headers.Authorization == null) {
    return Promise.reject(new Error('No token set'));
  }
  return config;
})
