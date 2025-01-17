import axios from '../../customize/axios';

export const USER_LOGIN_REQUEST = 'USER_LOGIN_REQUEST';
export const USER_LOGIN_FAILED = 'USER_LOGIN_FAILED';
export const USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS';

export const USER_LOGOUT_REQUEST = 'USER_LOGOUT_REQUEST';
export const USER_LOGOUT_FAILED = 'USER_LOGOUT_FAILED';
export const USER_LOGOUT_SUCCESS = 'USER_LOGOUT_SUCCESS';

export const doLogin = (ssoToken) => {
	return async (dispatch, getState) => {
		dispatch({ type: USER_LOGIN_REQUEST });
		axios
			.post(
				process.env.REACT_APP_BACKEND_SSO_VERIFY_TOKEN,
				{ ssoToken }
				//{ withCredentials: true } //truyền cookie của localhost cổng 8080 lên cổng 3000 ở req header
			)
			.then((res) => {
				if (res && +res.EC === 0) {
					dispatch({ type: USER_LOGIN_SUCCESS, user: res.DT });

					//success
					// navigate('/');
				} else {
					// setMessage(res.EM);
					dispatch({ type: USER_LOGIN_FAILED, error: res.EM });
				}
			})
			.catch((err) => {
				dispatch({ type: USER_LOGIN_FAILED, error: 'Something wrongs' });
				console.log('>>>err: ', err);
			});
	};
};

export const doGetAccount = () => {
	return async (dispatch, getState) => {
		dispatch({ type: USER_LOGIN_REQUEST });
		axios
			.get(
				process.env.REACT_APP_BACKEND_SSO_GET_ACCOUNT
				//{ withCredentials: true } //truyền cookie của localhost cổng 8080 lên cổng 3000 ở req header
			)
			.then((res) => {
				if (res && +res.EC === 0) {
					dispatch({ type: USER_LOGIN_SUCCESS, user: res.DT });
					dispatch(doGetAccount());

					//success
					// navigate('/');
				} else {
					// setMessage(res.EM);
					dispatch({ type: USER_LOGIN_FAILED, error: res.EM });
					//khi chua login thi van vao dc trang Home
					if (window.location.pathname !== '/')
						window.location.href = `${process.env.REACT_APP_BACKEND_SSO_LOGIN}?serviceURL=${process.env.REACT_APP_CURRENT_PROJECT_URL}`;
				}
			})
			.catch((err) => {
				dispatch({ type: USER_LOGIN_FAILED, error: 'Something wrongs' });
				console.log('>>>err: ', err);
			});
	};
};

export const doLogOut = () => {
	return async (dispatch, getState) => {
		dispatch({ type: USER_LOGOUT_REQUEST });
		axios
			.post(
				process.env.REACT_APP_BACKEND_SSO_LOGOUT,
				{ abc: 'abc' }
				//{ withCredentials: true }
			)
			.then((res) => {
				if (res && +res.EC === 0) {
					dispatch({ type: USER_LOGOUT_SUCCESS });
					window.location.href = '/';
				} else {
					dispatch({ type: USER_LOGOUT_FAILED, error: res.EM });
				}
			})
			.catch((err) => {
				dispatch({ type: USER_LOGOUT_FAILED, error: 'Something wrongs' });
				console.log('>>>err: ', err);
			});
	};
};
