import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import UserModel from '../models/usermodels.js';
import transporter from '../config/nodemailer.js';



export const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.json({ success: false, message: 'Missing Details' })
    }


    try {
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "User already existed" })
        }

        const hashedpassword = await bcrypt.hash(password, 10);

        const user = new UserModel({ name, email, password: hashedpassword });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Welcome to Masti Villaa",
            text: `Its a great pleasure for us to live with you .Your email is registered with ${email}`
        }

        try {
            await transporter.sendMail(mailOptions);
        } catch (err) {
            console.error("Email sending failed:", err.message);
            // don't block user registration just because of email failure
        }

        return res.json({ success: true });
    }
    catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: 'Email and Password are required' });
    }

    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'Invalid Email' });
        }

        const ismatch = await bcrypt.compare(password, user.password)
        if (!ismatch) {
            return res.json({ success: false, message: 'Invalid Password' })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({ success: true , userData: user});
    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })

        return res.json({ success: true, message: "Logged Out" });
    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const sendVerifyOtp = async (req, res) => {
    try {
        const userId = req.userId;



        const user = await UserModel.findById(userId);


        if (!user) {

            return res.json({ success: false, message: "User not found" });
        }


        if (user.isaccountverified) {

            return res.json({ success: false, message: 'Account Already Verified' });
        }
        const email = user.email;
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyotp = otp;
        user.verifyotpexpireat = Date.now() + 24 * 60 * 60 * 1000;

        await user.save();


        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: "Account Verification OTP",
            text: `Your OTP is ${otp}.Your email is registered with ${email}`
        }


        await transporter.sendMail(mailOptions);


        res.json({ success: true, message: 'Verification OTP sent on email' })

    }
    catch (error) {
        return res.json({ success: false, message: error.message })
    }
}

export const verifyEmail = async (req, res) => {

    const userId = req.userId;
    const { otp } = req.body;


    if (!userId || !otp) {
        return res.json({ success: false, message: 'Missing Details' });
    }
    try {

        const user = await UserModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        if (user.verifyotp === '' || user.verifyotp !== otp) {
            return res.json({ success: false, message: 'Invalid Otp' });
        }

        if (user.verifyotpexpireat < Date.now()) {
            return res.json({ success: false, message: 'Otp Expired' });
        }

        user.isaccountverified = true;
        user.verifyotp = ' ';
        user.verifyotpexpireat = 0;

        await user.save();

        return res.json({ success: true, message: 'Email Verified Successfully' })
    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
}


export const isAuthenticated = (req, res) => {
    try {
        return res.json({ success: true });
    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const SendResetOtp = async (req, res) => {

    const { email } = req.body;
    if (!email) {
        return res.json({ success: false, message: 'Email is required' })
    }
    try {

        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetotp = otp;
        user.resetotpexpireat = Date.now() + 15 * 60 * 1000;

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: `Password Reset OTP`,
            text: `Your OTP for reseting your password is ${otp}`
        }

        await transporter.sendMail(mailOptions);

        return res.json({ success: true, message: 'OTP sent to your email' })

    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const ResetPassword = async (req, res) => {
    const { email} = req.body;
     const { otp } = req.body;
     const {newPassword } =req.body;
   
    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: 'Email ,OTP , New Password are required' })
    }
    try {
           const user = await UserModel.findOne({email});
           if(!user){
            return res.json({success:false,message:'User not found'})
           }

           if(user.resetotp === '' || user.resetotp !== otp)
           {
             return res.json({success:false,message:'Invalid Otp'})
           }
           if(user.resetotpexpireat<Date.now()){
            return res.json({success:false,message:'OTP Expired'})
           }

           const hashedPassword = await bcrypt.hash(newPassword,10);

           user.password=hashedPassword;
           user.resetotp='';
           user.resetotpexpireat=0;

           await user.save();

           return res.json({success:true,message:'Password has been reset successfully'})
    }
    catch (error) {
        return res.json({ success: false, message: error.message });

    }
}