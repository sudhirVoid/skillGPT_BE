import {Request, Response, NextFunction} from 'express';
import admin from 'firebase-admin';
const routesToSkip = ['/paymentData/setPayDetailsWebhookNeon', '/hello','/generate/quiz']
const authenticator = async (req:Request, res:Response, next: NextFunction) =>{
    
    try {
      if(routesToSkip.includes(req.path)){
        next();
      }
      else{
        let userId = req.headers['x-user-id'] as string;
        admin.auth().getUser(userId).then(data=>{
          next();
        }).catch(error=>{
          console.log(error);
            res.status(401).json({
                error: 'Unauthorized',
                msg: 'Request from Unauthorized User.',
                statusCode:401
            })
        })
      }
      }
      catch (error) {
        res.send('I failed.');  
}
}
export {authenticator as userAuthenticator}