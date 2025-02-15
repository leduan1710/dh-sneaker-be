import paypal from '@paypal/checkout-server-sdk';
import axios from 'axios';
import { isAuth } from '../../middleware/auth.middleware.js';
import RequestWithdrawRepository from '../../repositories/RequestWithdrawRepository.js';

let environment = new paypal.core.SandboxEnvironment(process.env.CID, process.env.SC);
let client = new paypal.core.PayPalHttpClient(environment);
class PaymentController {
    initRoutes(app) {
        app.post('/create-order', this.createOrder);
        app.post('/capture-order/:orderId', this.captureOrder);
        app.post('/admin/withdraw', isAuth, async (req, res) => {
            try {
                if (req.user.role == 'ADMIN') {
                    const withdraw = await RequestWithdrawRepository.find(req.body.requestWithdrawId);
                    if (!withdraw) {
                        res.status(500).send('Error processing payout');
                    }
                    const accessToken = await this.getAccessToken();
                    const payoutResult = await this.createPayout(
                        accessToken,
                        withdraw.value / 25000,
                        'sb-qf1zr33487548@personal.example.com',
                    );
                    res.status(200).json(payoutResult);
                } else {
                    res.status(403).send('unauthorized');
                }
            } catch (error) {
                console.error('Error:', error.response ? error.response.data : error.message);
                res.status(500).send('Error processing payout');
            }
        });
    }
    async getAccessToken() {
        const response = await axios.post('https://api.sandbox.paypal.com/v1/oauth2/token', null, {
            auth: {
                username: process.env.CID,
                password: process.env.SC,
            },
            params: {
                grant_type: 'client_credentials',
            },
        });

        return response.data.access_token;
    }
    async createPayout(accessToken, amount, receiverEmail) {
        const payoutData = {
            sender_batch_header: {
                sender_batch_id: `batch_${Math.random().toString(36).substring(7)}`,
                email_subject: 'You have a payment',
            },
            items: [
                {
                    recipient_type: 'EMAIL',
                    amount: {
                        value: amount,
                        currency: 'USD',
                    },
                    receiver: 'sb-qf1zr33487548@personal.example.com',
                    note: 'Payment for services',
                    sender_item_id: 'item_1',
                },
            ],
        };

        const response = await axios.post('https://api.sandbox.paypal.com/v1/payments/payouts', payoutData, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        });

        return response.data;
    }
    async captureOrder(req, res) {
        const request = new paypal.orders.OrdersCaptureRequest(req.params.orderId);
        request.requestBody({});

        try {
            const capture = await client.execute(request);
            res.json(capture.result);
        } catch (error) {
            console.error(error);
            res.status(500).send('Error capturing order');
        }
    }
    async createOrder(req, res) {
        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer('return=representation');
        request.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: 'USD',
                        value: req.body.amount.toString(),
                        breakdown: { item_total: { currency_code: 'USD', value: req.body.amount.toString() } },
                    },
                    items: [
                        {
                            name: 'Pay',
                            unit_amount: {
                                currency_code: 'USD',
                                value: req.body.amount.toString(),
                            },
                            quantity: 1,
                        },
                    ],
                },
            ],
        });

        try {
            const order = await client.execute(request);
            res.json({ id: order.result.id });
        } catch (error) {
            console.error(error);
            res.status(500).send('Error creating order');
        }
    }
}

export default new PaymentController();
