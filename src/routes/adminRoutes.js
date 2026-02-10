const express = require('express');
const router = express.Router();
const walletService = require('../services/walletService');
const { validateAdminWalletRequest } = require('../middleware/validation');

router.post('/credit', validateAdminWalletRequest, async (req, res, next) => {
    try {
        const { validatedClientId, validatedAmount } = req;

        const result = await walletService.creditWallet(validatedClientId, validatedAmount);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});


router.post('/debit', validateAdminWalletRequest, async (req, res, next) => {
    try {
        const { validatedClientId, validatedAmount } = req;

        const result = await walletService.debitWallet(validatedClientId, validatedAmount);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

module.exports = router;