import express, { Request, Response, NextFunction } from 'express';
import contentGeneratorRouter  from './routes/generate';
import userDataRouter from './routes/fetchUserData'
import paymentDataRouter from './routes/paymentData'
import cors from "cors";
import { PORT } from './constants/constants';
import { bookInsertion} from './controllers/db';
import { RazorpayHeaders } from 'razorpay/dist/types/api';
import Razorpay from 'razorpay';
import { RAZORPAYKEYID,RAZORPAYKEYSECRET } from './constants/constants';


import puppeteer from 'puppeteer';
import fs from 'fs'
import path from 'path'
const app = express();
const port = PORT || 3000;
const razorPayKeyID = process.env.RazorPay_key_id!;
const razorPayKeySecret = process.env.RazorPay_key_secret!;

const utility = {
  rupeesToPaise: function (rupees: number) {
    return rupees * 100;
  },
  paiseToRupees: function (paise: number) {
    return paise / 100;
  },
};

app.use(express.json());
app.use(cors({
  origin: ['https://skillgpt.netlify.app'] // or '*'
}));
// // app.use(cors());


var instance = new Razorpay({
  key_id: RAZORPAYKEYID as string,
  key_secret: RAZORPAYKEYSECRET as string,
});


app.get('/hello', (req: Request, res: Response) => {
  res.send('Hello World!');
})
// for all generating content from GPT we use this path requests.
app.use('/generate', contentGeneratorRouter);
app.use('/userData', userDataRouter);
//payroute
app.use('/paymentData', paymentDataRouter);
// Add this error handling middleware

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong');
});

app.post("/api/createPaymentOrder", (req, res) => {
  // Handle POST request here
  var amount = utility.rupeesToPaise(req.body.payload.amount);
  console.log("amount : ", req.body);
  var options = {
    amount: amount, // amount in the smallest currency unit here paise
    currency: "INR",
    receipt: "order_rcptid_11",
    notes: {
      key1: "value3",
      key2: "value2",
    },
  };
  instance.orders.create(options, function (err, order) {
    if (err) {
      res.status(500);
      let response = { status: 500, data: err };
      res.send(response);
    } else if (order) {
      res.status(200);
      let response = { status: 200, data: order };
      res.send(response);
    }
  });
});

app.post("/api/validatePayment", (req, res) => {
  const razorpay_signature = req.body.payload.razorpay_signature;
  const secret = RAZORPAYKEYSECRET;
  const order_id = req.body.payload.original_order_id;
  const razorpay_payment_id = req.body.payload.razorpay_payment_id;
  var {
    validatePaymentVerification ,
  } = require("../node_modules/razorpay/dist/utils/razorpay-utils.js");

  const isPaymentVerified = validatePaymentVerification(
    { order_id: order_id, payment_id: razorpay_payment_id },
    razorpay_signature,
    secret
  );
  isPaymentVerified ? res.status(200) : res.status(500);
  res.send({ data: { isPaymentVerified: isPaymentVerified, 
    order_id: order_id, payment_id: razorpay_payment_id
   } });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});


export default app;