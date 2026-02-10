const pool = require('../database/db');

class WalletService {

    async creditWallet(clientId, amount) {
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
                `UPDATE wallets 
         SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP 
         WHERE client_id = $2 
         RETURNING balance`,
                [amount, clientId]
            );

            if (walletResult.rows.length === 0) {
                throw new Error('Wallet not found for this client');
            }

            const newBalance = parseFloat(walletResult.rows[0].balance);


            const ledgerResult = await client.query(
                `INSERT INTO ledger (client_id, transaction_type, amount, balance_after, description) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
                [clientId, 'CREDIT', amount, newBalance, 'Admin credit']
            );


            await client.query('COMMIT');

            return {
                success: true,
                message: 'Amount credited successfully',
                balance: newBalance,
                transaction: ledgerResult.rows[0]
            };
        } catch (error) {

            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }


    async debitWallet(clientId, amount) {
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


            const balanceCheck = await client.query(
                'SELECT balance FROM wallets WHERE client_id = $1',
                [clientId]
            );

            if (balanceCheck.rows.length === 0) {
                throw new Error('Wallet not found for this client');
            }

            const currentBalance = parseFloat(balanceCheck.rows[0].balance);


            if (currentBalance < amount) {
                throw new Error(`Insufficient balance. Available: ${currentBalance}, Required: ${amount}`);
            }


            const walletResult = await client.query(
                `UPDATE wallets 
         SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP 
         WHERE client_id = $2 
         RETURNING balance`,
                [amount, clientId]
            );

            const newBalance = parseFloat(walletResult.rows[0].balance);


            const ledgerResult = await client.query(
                `INSERT INTO ledger (client_id, transaction_type, amount, balance_after, description) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
                [clientId, 'DEBIT', amount, newBalance, 'Admin debit']
            );

            await client.query('COMMIT');

            return {
                success: true,
                message: 'Amount debited successfully',
                balance: newBalance,
                transaction: ledgerResult.rows[0]
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }


    async getBalance(clientId) {
        try {
            const result = await pool.query(
                `SELECT w.balance, c.name 
         FROM wallets w 
         JOIN clients c ON w.client_id = c.id 
         WHERE w.client_id = $1`,
                [clientId]
            );

            if (result.rows.length === 0) {
                throw new Error('Wallet not found for this client');
            }

            return {
                client_id: parseInt(clientId),
                client_name: result.rows[0].name,
                balance: parseFloat(result.rows[0].balance)
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new WalletService();