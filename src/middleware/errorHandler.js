
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);


    if (err.code === '23505') {
        return res.status(409).json({
            success: false,
            error: 'Resource already exists'
        });
    }

    if (err.code === '23503') {
        return res.status(400).json({
            success: false,
            error: 'Referenced resource does not exist'
        });
    }

    if (err.code === '23514') {
        return res.status(400).json({
            success: false,
            error: 'Invalid data - constraint violation'
        });
    }


    if (err.message.includes('not found')) {
        return res.status(404).json({
            success: false,
            error: err.message
        });
    }

    if (err.message.includes('Insufficient balance')) {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }

    if (err.message.includes('unauthorized')) {
        return res.status(403).json({
            success: false,
            error: err.message
        });
    }


    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
};


const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.path} not found`
    });
};

module.exports = {
    errorHandler,
    notFoundHandler
};