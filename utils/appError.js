
class appError extends Error {
    constructor(message,statusCode){
        //parent call using super(message)
        super(message);
        this.statusCode = statusCode;
        //if statusCode start with 4 => fail
        this.status = `${statusCode}`.startsWith('4')?'fail':'error';

        //every error that comes into this class would be classified as an operational error
        this.isOperational = true;
        Error.captureStackTrace(this,this.constructor);
    }
}

module.exports = appError;