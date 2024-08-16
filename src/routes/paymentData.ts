import { Router, Request, Response } from "express";
import { setPayDetailsNeon, setPayDetailsWebhookNeon  } from "../controllers/db";

const router: Router = Router();

router.post("/setPayDetailsNeon", async (req: Request, res: Response) => {
    let payDetails = req.body.payObj;
    let setPayDetails = await setPayDetailsNeon(payDetails);
    res.json({msg: setPayDetails});
});

router.post("/setPayDetailsWebhookNeon", async (req: Request, res: Response) => {
  let payDetailsWebhook = req.body;
   await setPayDetailsWebhookNeon(payDetailsWebhook);
});


export default router;
