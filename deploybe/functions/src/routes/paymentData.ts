import { Router, Request, Response } from "express";
import { setPayDetailsNeon, setPayDetailsWebhookNeon  } from "../controllers/db";
import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils';
import { RAZORPAYWEBHOOKSECRET } from "../constants/constants";

const router: Router = Router();


router.post("/setPayDetailsNeon", async (req: Request, res: Response) => {
    let payDetails = req.body.payObj;
    let setPayDetails = await setPayDetailsNeon(payDetails);
    res.json({msg: setPayDetails});
});

router.post("/setPayDetailsWebhookNeon", async (req: Request, res: Response) => {
  let payDetailsWebhook = req.body;
  const webhookSecret = RAZORPAYWEBHOOKSECRET as string;
  let validation = validateWebhookSignature(JSON.stringify(req.body), req.rawHeaders[23], webhookSecret);
  // console.log(validation);
  if(validation){
    await setPayDetailsWebhookNeon(payDetailsWebhook);
  }
  else{
    res.json({msg: "Invalid Secret"});
  }
});

export default router;
