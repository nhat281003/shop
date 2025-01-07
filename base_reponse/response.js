const successResponse = (res, statusCode, message, data) => {
    return res.status(statusCode).json({
        success: true,
        message: message || "Success",
        data: data || {}
    });
};




const errorResponse = (res, statusCode, message, error) => {
    return res.status(statusCode).json({
        success: false,
        message: message || "An error occurred",
        error: error || "An error occurred"
    });
};



module.exports = {successResponse, errorResponse};