import Axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

const axios = Axios.create({
	baseURL: "",
});

const authRequestInterceptor = (
	config: AxiosRequestConfig,
): AxiosRequestConfig => {
	config.headers = config.headers || {};
	config.headers.Accept = "application/json";
	return config;
};

const requestErrorHandler = (error: AxiosError): Promise<AxiosError> => {
	console.log("🚀 ~ req.interceptor ~", error);
	return Promise.reject(error);
};

const responseSuccessHandler = <T>(
	response: AxiosResponse<T>,
): AxiosResponse<T> => {
	return response;
};

const responseErrorHandler = <T>(
	error: AxiosError<T>,
): Promise<AxiosError<T>> => {
	console.log("🚀 ~ res.interceptor ~", error.response?.data);

	return Promise.reject(error);
};

// @ts-ignore
axios.interceptors.request.use(authRequestInterceptor, requestErrorHandler);
axios.interceptors.response.use(responseSuccessHandler, responseErrorHandler);

export default axios;
