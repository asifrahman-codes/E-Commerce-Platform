import multer from "multer";

const errorHandler = (err, req, res, next) => {

    if (err instanceof multer.MulterError) {

        if (err.code === "LIMIT_FILE_SIZE") {

            return res.status(400).json({
                success: false,
                message: "Each image must not exceed 5 MB."
            });

        }

        if (err.code === "LIMIT_FILE_COUNT") {

            return res.status(400).json({
                success: false,
                message: "You can upload a maximum of 5 images."
            });

        }

        return res.status(400).json({
            success: false,
            message: err.message
        });

    }

    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({

        success: false,

        message: err.message || "Internal Server Error",

        stack:
            process.env.NODE_ENV === "development"
                ? err.stack
                : undefined

    });

};

export default errorHandler;