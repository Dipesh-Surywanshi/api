const express = require('express');
const router = express.Router();
const walletService = require('../services/walletService');
const { validateClientId } = require('../middleware/validation');


router.get('/balance', validateClientId, async (req, res, next) => {
    try {
        const { clientId } = req;

        const result = await walletService.getBalance(clientId);

        res.status(200).json({
            success: true,
            wallet: result
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;