import express from 'express';
import userAuth from '../middleware/userauth.js';
import { getuserData } from '../controller/usercontroller.js';

const userRouter=express.Router();

userRouter.get('/data',userAuth,getuserData)


export default userRouter;