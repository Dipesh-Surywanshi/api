const express = require('express');
const router = express.Router();
const orderService = require('../services/orderService');
const { validateClientId, validateAmount, validateOrderId } = require('../middleware/validation');


router.post('/', validateClientId, validateAmount, async (req, res, next) => {
    try {
        const { clientId, validatedAmount } = req;

        const result = await orderService.createOrder(clientId, validatedAmount);

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});


router.get('/:order_id', validateClientId, validateOrderId, async (req, res, next) => {
    try {
        const { orderId, clientId } = req;

        const result = await orderService.getOrderDetails(orderId, clientId);

        res.status(200).json({
            success: true,
            order: result
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;