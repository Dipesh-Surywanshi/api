const pool = require('../database/db');
const axios = require('axios');
require('dotenv').config();

class OrderService {

    async createOrder(clientId, amount) {
        const client = await pool.connect();

        try {

            await client.query('BEGIN');


            const clientCheck = await client.query(
                'SELECT id FROM clients WHERE id = $1',
                [clientId]
            );

            if (clientCheck.rows.length === 0) {
                throw new Error('Client not found');
            }


            const walletResult = await client.query(
                'SELECT balance FROM wallets WHERE client_id = $1 FOR UPDATE',
                [clientId]
            );

            if (walletResult.rows.length === 0) {
                throw new Error('Wallet not found for this client');
            }

            const currentBalance = parseFloat(walletResult.rows[0].balance);

            if (currentBalance < amount) {
                throw new Error(`Insufficient balance. Available: ${currentBalance}, Required: ${amount}`);
            }


            const updatedWallet = await client.query(
                `UPDATE wallets 
         SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP 
         WHERE client_id = $2 
         RETURNING balance`,
                [amount, clientId]
            );

            const newBalance = parseFloat(updatedWallet.rows[0].balance);


            const orderResult = await client.query(
                `INSERT INTO orders (client_id, amount, status) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
                [clientId, amount, 'PENDING']
            );

            const order = orderResult.rows[0];


            await client.query(
                `INSERT INTO ledger (client_id, transaction_type, amount, balance_after, description) 
         VALUES ($1, $2, $3, $4, $5)`,
                [clientId, 'ORDER', amount, newBalance, `Order #${order.id}`]
            );


            await client.query('COMMIT');


            let fulfillmentId = null;
            let orderStatus = 'COMPLETED';

            try {
                const fulfillmentResponse = await axios.post(
                    process.env.FULFILLMENT_API_URL || 'https://jsonplaceholder.typicode.com/posts',
                    {
                        userId: clientId.toString(),
                        title: order.id.toString()
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        timeout: 5000 // 5 second timeout
                    }
                );


                fulfillmentId = fulfillmentResponse.data.id.toString();

            } catch (apiError) {
                console.error('Fulfillment API error:', apiError.message);
                orderStatus = 'FAILED';

            }


            const finalOrder = await pool.query(
                `UPDATE orders 
         SET fulfillment_id = $1, status = $2 
         WHERE id = $3 
         RETURNING *`,
                [fulfillmentId, orderStatus, order.id]
            );

            return {
                success: true,
                message: 'Order created successfully',
                order: {
                    id: finalOrder.rows[0].id,
                    client_id: finalOrder.rows[0].client_id,
                    amount: parseFloat(finalOrder.rows[0].amount),
                    status: finalOrder.rows[0].status,
                    fulfillment_id: finalOrder.rows[0].fulfillment_id,
                    created_at: finalOrder.rows[0].created_at
                },
                new_balance: newBalance
            };

        } catch (error) {

            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }


    async getOrderDetails(orderId, clientId) {
        try {
            const result = await pool.query(
                `SELECT o.*, c.name as client_name 
         FROM orders o 
         JOIN clients c ON o.client_id = c.id 
         WHERE o.id = $1 AND o.client_id = $2`,
                [orderId, clientId]
            );

            if (result.rows.length === 0) {
                throw new Error('Order not found or unauthorized');
            }

            const order = result.rows[0];

            return {
                id: order.id,
                client_id: order.client_id,
                client_name: order.client_name,
                amount: parseFloat(order.amount),
                status: order.status,
                fulfillment_id: order.fulfillment_id,
                created_at: order.created_at
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new OrderService();