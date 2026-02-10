
const validateClientId = (req, res, next) => {
    const clientId = req.headers['client-id'];

    if (!clientId) {
        return res.status(400).json({
            success: false,
            error: 'client-id header is required'
        });
    }

    const parsedClientId = parseInt(clientId);

    if (isNaN(parsedClientId) || parsedClientId <= 0) {
        return res.status(400).json({
            success: false,
            error: 'client-id must be a valid positive integer'
        });
    }

    req.clientId = parsedClientId;
    next();
};


const validateAmount = (req, res, next) => {
    const { amount } = req.body;

    if (amount === undefined || amount === null) {
        return res.status(400).json({
            success: false,
            error: 'amount is required in request body'
        });
    }

    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
            success: false,
            error: 'amount must be a positive number'
        });
    }


    req.validatedAmount = Math.round(parsedAmount * 100) / 100;
    next();
};


const validateAdminWalletRequest = (req, res, next) => {
    const { client_id, amount } = req.body;


    if (!client_id) {
        return res.status(400).json({
            success: false,
            error: 'client_id is required in request body'
        });
    }

    const parsedClientId = parseInt(client_id);

    if (isNaN(parsedClientId) || parsedClientId <= 0) {
        return res.status(400).json({
            success: false,
            error: 'client_id must be a valid positive integer'
        });
    }


    if (amount === undefined || amount === null) {
        return res.status(400).json({
            success: false,
            error: 'amount is required in request body'
        });
    }

    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
            success: false,
            error: 'amount must be a positive number'
        });
    }

    req.validatedClientId = parsedClientId;
    req.validatedAmount = Math.round(parsedAmount * 100) / 100;
    next();
};


const validateOrderId = (req, res, next) => {
    const orderId = parseInt(req.params.order_id);

    if (isNaN(orderId) || orderId <= 0) {
        return res.status(400).json({
            success: false,
            error: 'order_id must be a valid positive integer'
        });
    }

    req.orderId = orderId;
    next();
};

module.exports = {
    validateClientId,
    validateAmount,
    validateAdminWalletRequest,
    validateOrderId
};