require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const path = require('path');

const app = express();
const port = 3000;

// Validate environment variables
if (!process.env.FLUTTERWAVE_PUBLIC_KEY || !process.env.FLUTTERWAVE_SECRET_KEY || !process.env.FLUTTERWAVE_ENCRYPTION_KEY) {
    console.error('Error: FLUTTERWAVE_PUBLIC_KEY, FLUTTERWAVE_SECRET_KEY, and FLUTTERWAVE_ENCRYPTION_KEY must be set in .env file');
    process.exit(1);
}
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('Error: GOOGLE_APPLICATION_CREDENTIALS must be set in .env file');
    process.exit(1);
}

// Initialize Firebase Admin
try {
    admin.initializeApp({
        credential: admin.credential.cert(path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
    });
    console.log('Firebase Admin initialized successfully');
} catch (error) {
    console.error('Error initializing Firebase Admin:', error.message);
    process.exit(1);
}
const db = admin.firestore();

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.post('/create-flutterwave-payment', async (req, res) => {
    const { amount, currency, redirect_url, customer, meta } = req.body;
    if (!amount || !redirect_url || !customer || !meta) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
        const payload = {
            tx_ref: `TSL_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
            amount,
            currency: currency || 'NGN',
            redirect_url,
            payment_options: 'card,banktransfer,ussd',
            customer: {
                email: customer.email,
                phonenumber: customer.phonenumber,
                name: customer.name,
            },
            customizations: {
                title: 'TSL Fashion Purchase',
                description: 'Payment for items in cart',
                logo: 'https://yourwebsite.com/logo.png', // Replace with your logo URL
            },
            meta,
        };
        console.log('Payment payload:', payload);
        // Use Flutterwave's HTTP API to initiate payment
        const response = await axios.post(
            'https://api.flutterwave.com/v3/payments',
            payload,
            {
                headers: {
                    Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log('Flutterwave response:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error initiating payment:', error.message, error.response?.data);
        res.status(500).json({ error: 'Failed to initiate payment', details: error.message, flutterwaveError: error.response?.data });
    }
});

app.get('/verify-payment', async (req, res) => {
    const { transaction_id, status, tx_ref } = req.query;
    if (!transaction_id || !tx_ref) {
        return res.redirect('/order-confirmation.html?status=failed');
    }
    if (status === 'successful') {
        try {
            const verification = await axios.get(
                `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                    },
                }
            );
            console.log('Verification response:', verification.data);
            if (verification.data.status === 'success' && verification.data.data.status === 'successful') {
                const orderData = {
                    userId: verification.data.data.customer.email || 'anonymous',
                    items: verification.data.data.meta.cart,
                    amount: verification.data.data.amount,
                    currency: verification.data.data.currency,
                    transactionId: transaction_id,
                    txRef: tx_ref,
                    status: 'completed',
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    shippingStatus: 'pending',
                };
                await db.collection('orders').add(orderData);
                res.redirect('/order-confirmation.html?orderId=' + tx_ref);
            } else {
                res.redirect('/order-confirmation.html?status=failed');
            }
        } catch (error) {
            console.error('Error verifying payment:', error.message, error.response?.data);
            res.redirect('/order-confirmation.html?status=failed');
        }
    } else {
        res.redirect('/order-confirmation.html?status=failed');
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});