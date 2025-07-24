require('dotenv').config();
const express = require('express');
const Flutterwave = require('flutterwave-node-v3');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

const app = express();
const port = 3000;

// Validate Flutterwave keys
if (!process.env.FLUTTERWAVE_PUBLIC_KEY || !process.env.FLUTTERWAVE_SECRET_KEY) {
    console.error('Error: FLUTTERWAVE_PUBLIC_KEY and FLUTTERWAVE_SECRET_KEY must be set in .env file');
    process.exit(1);
}

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
});
const db = admin.firestore();

// Initialize Flutterwave
const flw = new Flutterwave(
    process.env.FLUTTERWAVE_PUBLIC_KEY,
    process.env.FLUTTERWAVE_SECRET_KEY
);

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.post('/create-flutterwave-payment', async (req, res) => {
    const { amount, currency, redirect_url, customer, meta } = req.body;
    try {
        const payload = {
            amount,
            currency: currency || 'NGN',
            redirect_url,
            customer,
            tx_ref: `TSL_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
            meta,
        };
        const response = await flw.Payment.initiate(payload);
        res.json(response);
    } catch (error) {
        console.error('Error initiating payment:', error);
        res.status(500).json({ error: 'Failed to initiate payment' });
    }
});

app.get('/verify-payment', async (req, res) => {
    const { transaction_id, status, tx_ref } = req.query;
    if (status === 'successful') {
        try {
            const verification = await flw.Transaction.verify({ id: transaction_id });
            if (verification.status === 'success' && verification.data.status === 'successful') {
                const orderData = {
                    userId: verification.data.customer.email || 'anonymous',
                    items: verification.data.meta.cart,
                    amount: verification.data.amount,
                    currency: verification.data.currency,
                    transactionId: transaction_id,
                    txRef: tx_ref,
                    status: 'completed',
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    shippingStatus: 'pending',
                };
                await db.collection('orders').add(orderData);

                const cartSnapshot = await db.collection('cart').get();
                const batch = db.batch();
                cartSnapshot.forEach(doc => batch.delete(doc.ref));
                await batch.commit();

                res.redirect('/order-confirmation.html?orderId=' + tx_ref);
            } else {
                res.redirect('/order-confirmation.html?status=failed');
            }
        } catch (error) {
            console.error('Error verifying payment:', error);
            res.redirect('/order-confirmation.html?status=failed');
        }
    } else {
        res.redirect('/order-confirmation.html?status=failed');
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});