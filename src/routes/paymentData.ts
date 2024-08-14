import { Router, Request, Response } from "express";
import { setPayDetailsNeon, setPayDetailsWebhookNeon  } from "../controllers/db";

const router: Router = Router();

router.post("/setPayDetailsNeon", async (req: Request, res: Response) => {
    let payDetails = req.body.payObj;
    // console.log("PayDetails Received : ", payDetails);
    let setPayDetails = await setPayDetailsNeon(payDetails);
    // console.log("setPayDetails : ", setPayDetails);
    res.json({msg: setPayDetails});
});

router.post("/setPayDetailsWebhookNeon", async (req: Request, res: Response) => {
  let payDetailsWebhook = req.body;

  // console.log("PayDetails Received Webhook: ", payDetailsWebhook);
   await setPayDetailsWebhookNeon(payDetailsWebhook);
  // console.log("setPayDetails : ", setPayDetails);
  // res.json({msg: setPayDetails});
});


export default router;
