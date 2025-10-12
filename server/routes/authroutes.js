import express from 'express';
import { isAuthenticated, login, logout, register, ResetPassword, SendResetOtp, sendVerifyOtp, verifyEmail } from '../controller/authcontroller.js';
import userAuth from '../middleware/userauth.js';

 const authRouter = express.Router();

authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
authRouter.post('/send-verify-otp',userAuth,sendVerifyOtp);
authRouter.post('/verify-account',userAuth,verifyEmail);
authRouter.get('/is-auth',userAuth,isAuthenticated);
authRouter.post('/send-reset-otp',SendResetOtp);
authRouter.post('/reset-password',ResetPassword);

export default authRouter;