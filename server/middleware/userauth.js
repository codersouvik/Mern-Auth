import jwt from 'jsonwebtoken';

const userAuth = async(req,res,next)=>{
    const {token}=req.cookies;
    if(!token)
    {
        return res.json({success:false,message: ' Not Authorized Login Again'});
    }

    try{

        const tokenDecoded =jwt.verify(token,process.env.JWT_SECRET);

     

        if(tokenDecoded.id){
            req.userId=tokenDecoded.id;
             next();
        }
        else{
           return res.json({success:false,message:'Not Authorized Again'})
        }

       

    }
    catch(error){
         return res.json({success:false,message: error.message});
    }
}

export default userAuth;