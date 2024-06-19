require('dotenv').config();
import axios from 'axios';

//Đối vs đường link này thì k check json header
const nonSecurePaths = ['/'];

const extractToken = (req) => {
	if (
		req.headers.authorization &&
		req.headers.authorization.split(' ')[0] === 'Bearer'
	) {
		return req.headers.authorization.split(' ')[1];
	}
	return null;
};

const checkUserJWT = async (req, res, next) => {
	//Xuất phát từ file home thì sẽ ko chạy dòng này
	if (nonSecurePaths.includes(req.path)) return next();

	let tokenFromHeader = extractToken(req);
	console.log('token from header: ', tokenFromHeader);

	if (tokenFromHeader) {
		let access_token = tokenFromHeader;
		axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

		//call SSO to verify token
		let resAPI = await axios.post(process.env.API_SSO_VERIFY_ACCESS_TOKEN);

		if (resAPI && resAPI.data && +resAPI.data.EC === 0) {
			next();
		} else {
			return res.status(400).json({
				EC: -1,
				DT: '',
				EM: 'Not authenticated the user'
			});
		}
	} else {
		return res.status(400).json({
			EC: -1,
			DT: '',
			EM: 'Not provide auth header token'
		});
	}
};

const checkUserPermission = (req, res, next) => {
	//Với api account thì ko check j cả, còn lại thì check quyền người dùng
	if (nonSecurePaths.includes(req.path) || req.path === '/account')
		return next();

	if (req.user) {
		let email = req.user.email;
		let roles = req.user.groupWithRoles.Roles;
		let currentUrl = req.path;
		if (!roles || roles.length === 0) {
			return res.status(403).json({
				EC: -1,
				DT: '',
				EM: `you don't permission to access this resource...`
			});
		}

		let canAccess = roles.some(
			(item) => item.url === currentUrl || currentUrl.includes(item.url)
		);
		if (canAccess === true) {
			next();
		} else {
			return res.status(403).json({
				EC: -1,
				DT: '',
				EM: `you don't permission to access this resource...`
			});
		}
	} else {
		return res.status(401).json({
			EC: -1,
			DT: '',
			EM: 'Not authenticated the user'
		});
	}
};

module.exports = {
	checkUserJWT,
	checkUserPermission
};
