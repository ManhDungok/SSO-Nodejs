import { v4 as uuidv4 } from 'uuid';
import loginRegisterService from '../service/loginRegisterService';
import { createJWT } from '../middleware/JWTAction';
import 'dotenv/config';
import nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

const getLoginPage = (req, res) => {
	const serviceURL = req.query.serviceURL;
	return res.render('login.ejs', {
		redirectURL: serviceURL
	});
};

const verifySSOToken = async (req, res) => {
	try {
		//return jwt, refresh token
		const ssoToken = req.body.ssoToken;

		//
		//check ssoToken
		if (req.user && req.user.code && req.user.code === ssoToken) {
			const refreshToken = uuidv4();

			//update user
			await loginRegisterService.updateUserRefreshToken(
				req.user.email,
				refreshToken
			);

			//create access token
			let payload = {
				email: req.user.email,
				groupWithRoles: req.user.groupWithRoles,
				username: req.user.username
			};

			let token = createJWT(payload);

			//set cookie
			res.cookie('access_token', token, {
				// maxAge: +process.env.MAX_AGE_ACCESS_TOKEN,
				maxAge: 900 * 1000,
				httpOnly: true,
				domain: process.env.COOKIE_DOMAIN,
				path: '/'
			});

			res.cookie('refresh_token', refreshToken, {
				// maxAge: +process.env.MAX_AGE_REFRESH_TOKEN,
				maxAge: 3600 * 1000,
				httpOnly: true,
				domain: process.env.COOKIE_DOMAIN,
				path: '/'
			});

			const resData = {
				access_token: token,
				refresh_token: refreshToken,
				email: req.user.email,
				groupWithRoles: req.user.groupWithRoles,
				username: req.user.username
			};

			//destroy session
			//đang dùng statelist,dùng token để định danh, khi đã có token rồi thì k cần session này nữa
			//k dùng nữa là vì cta k muốn ngkhac ăn trộm dc cookie của cta(có sessionId)
			//cách an toàn nhất là ko dùng nữa và xóa nó đi
			req.session.destroy(function (err) {
				req.logout();
			});

			return res.status(200).json({
				EM: 'OK',
				EC: 0,
				DT: resData
			});
		} else {
			return res.status(401).json({
				EM: 'not match ssoToken',
				EC: 1,
				DT: ''
			});
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			EM: 'Something wrong in the server...',
			EC: -1,
			DT: ''
		});
	}
};

const getResestPasswordPage = (req, res) => {
	return res.render('forgot-password.ejs');
};

const sendCode = async (req, res) => {
	//check xem email co hop le ko
	let checkEmailLocal = await loginRegisterService.isEmailLocal(req.body.email);

	if (!checkEmailLocal) {
		return res.status(401).json({
			DT: '',
			EC: -1,
			EM: `Not found the email: ${req.body.email} in the system`
		});
	}

	//gui ma code cho email
	const OTP = Math.floor(1000 + Math.random() * 900000);

	const filePath = path.join(__dirname, '../templates/reset-password.html');
	console.log('check filePath: ', filePath);
	const source = fs.readFileSync(filePath, 'utf-8').toString();
	const template = handlebars.compile(source);
	const replacements = {
		email: req.body.email,
		otp: OTP
	};
	const htmlToSend = template(replacements);

	const transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 587,
		secure: false, // Use `true` for port 465, `false` for all other ports
		auth: {
			user: process.env.GOOGLE_APP_EMAIL,
			pass: process.env.GOOGLE_APP_PASSWORD
		}
	});

	res.status(200).json({
		EC: 0,
		DT: { email: req.body.email }
	});

	// send mail with defined transport object
	try {
		await transporter.sendMail({
			from: `Manh Dung 👻<${process.env.GOOGLE_APP_EMAIL}>`,
			to: `${req.body.email}`, // list of receivers
			subject: 'Hello Reset email from SSO', // Subject line
			text: 'Hello world?', // plain text body
			html: htmlToSend
		});
		//update code in database
		await loginRegisterService.updateUserCode(OTP, req.body.email);
	} catch (error) {
		console.log(error);
	}
};

const handleResetPassword = async (req, res) => {
	try {
		let result = await loginRegisterService.resetUserPassword(req.body);
		if (result === true) {
			return res.status(200).json({
				EC: 0
			});
		} else {
			return res.status(500).json({
				EC: -1,
				EM: 'something wrong... pls try again',
				DT: ''
			});
		}
	} catch (error) {
		return res.status(500).json({
			EC: -2,
			EM: 'Internal error',
			DT: ''
		});
	}
};

module.exports = {
	getLoginPage,
	verifySSOToken,
	getResestPasswordPage,
	sendCode,
	handleResetPassword
};
