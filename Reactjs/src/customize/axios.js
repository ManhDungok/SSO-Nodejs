import axios from 'axios';
import axiosRetry from 'axios-retry';

// khi truyền vào injectStore thì biến (_store) sẽ gán lại gtri cho store
let store;
export const injectStore = (_store) => {
	store = _store;
};

// Set config defaults when creating the instance
const instance = axios.create({
	// baseURL: 'https://api.example.com'
	withCredentials: true
});

axiosRetry(instance, {
	retries: 3,
	retryCondition: (error) => {
		return error.response.status === 400 || error.response.status === 405;
	},
	retryDelay: (retryCount, error) => {
		//lời gọi sau sẽ bị delay 100ms
		return retryCount * 100;
	}
});

// Add a request interceptor
instance.interceptors.request.use(
	function (config) {
		// Alter defaults after instance has been created
		let headerToken = store.getState()?.account?.userInfo?.access_token ?? '';
		if (headerToken) {
			config.headers.Authorization = `Bearer ${headerToken}`;
		}

		// Do something before request is sent
		return config;
	},
	function (error) {
		// Do something with request error
		return Promise.reject(error);
	}
);

// Add a response interceptor
instance.interceptors.response.use(
	function (response) {
		// Any status code that lie within the range of 2xx cause this function to trigger
		// Do something with response data
		return response && response.data ? response.data : response;
	},
	function (error) {
		// if (error.response.status === 400) {
		// 	let headerToken = store.getState()?.account?.userInfo?.access_token ?? '';
		// 	if (headerToken) {
		// 		error.config.headers.Authorization = `Bearer ${headerToken}`;
		// 	}
		// 	return axios.request(error.config);
		// }

		// Any status codes that falls outside the range of 2xx cause this function to trigger
		// Do something with response error
		if (error && error.response && error.response.data)
			return error.response.data;
		return Promise.reject(error);
	}
);

export default instance;
