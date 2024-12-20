const functions = require ("firebase-functions");
import express, { Request, Response, NextFunction } from 'express';
import contentGeneratorRouter  from './routes/generate';
import userDataRouter from './routes/fetchUserData'
import paymentDataRouter from './routes/paymentData'
import { PORT } from './constants/constants';
import Razorpay from 'razorpay';
import { RAZORPAYKEYID,RAZORPAYKEYSECRET } from './constants/constants';
import { updateUserDataRouter } from './routes/updateUserData';
import { userAuthenticator } from './middlewares/authenticator';
import { initializeFirebaseAdmin } from './utils/initFirebaseAdmin';
const app = express();
initializeFirebaseAdmin();
const port = PORT || 3000;
const utility = {
  rupeesToPaise: function (rupees: number) {
    return rupees * 100;
  },
  paiseToRupees: function (paise: number) {
    return paise / 100;
  },
};

// app.use((req, res, next) => {
//   console.log('Request Headers:', req.headers);
//   next();
// });
app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  const corsWhitelist = [
    'https://skillgpt.netlify.app',
    'https://skillgpt.online',
    'http://localhost:4200'
  ];
 
  const origin = req.headers.origin as string | undefined;
 
  if (origin && corsWhitelist.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-User-Id');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
 
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
  }
 
  next();
});
 
// app.use(cors());
app.use(userAuthenticator)

var instance = new Razorpay({
  key_id: RAZORPAYKEYID as string,
  key_secret: RAZORPAYKEYSECRET as string,
});

app.get('/', (req: Request, res: Response) => {
    res.send('Hello from 3S.')
  })
app.get('/hello', (req: Request, res: Response) => {
  res.send('Hello from other world.')
})
// for all generating content from GPT we use this path requests.
app.use('/generate', contentGeneratorRouter);
app.use('/userData', userDataRouter);
app.use('/update', updateUserDataRouter);

//payroute
app.use('/paymentData', paymentDataRouter);
// Add this error handling middleware



app.post("/api/createPaymentOrder", (req, res) => {
  // Handle POST request here
  var amount = utility.rupeesToPaise(req.body.payload.amount);
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

// error handling for the whole application.
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
exports.app = functions.https.onRequest(app);
