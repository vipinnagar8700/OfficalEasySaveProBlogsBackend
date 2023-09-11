// not found

const notFound = (req,res,next)=>{
    const error = new Error (`Not found : ${req.originUrl}`);
    res.status(404);
    next (error)
}

// error Handler

const errorHandler =  (err,req,res,next)=>{
    const statuscode = res.statusCode== 200 ? 500 : res.statusCode;
    res.json({
        message: err?.message,
        stack: err?.stack
    })
};


module.exports = {errorHandler,notFound};