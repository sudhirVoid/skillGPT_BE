import {Request, Response, NextFunction} from 'express';
import admin from 'firebase-admin';
const authenticator = async (req:Request, res:Response, next: NextFunction) =>{
    let userId = req.headers['x-user-id'] as string;
    try {
        admin.auth().getUser(userId).then(data=>{
          next();
        }).catch(error=>{
            res.status(401).json({
                error: 'Unauthorized',
                msg: 'Request from Unauthorized User.',
                statusCode:401
            })
        })
      } catch (error) {
        res.send('I failed.');
      }
}
export {authenticator as userAuthenticator}