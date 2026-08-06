import multer from "multer";

import ApiError from "../utils/ApiError.js";

/*
|--------------------------------------------------------------------------
| Memory Storage
|--------------------------------------------------------------------------
*/

const storage = multer.memoryStorage();

/*
|--------------------------------------------------------------------------
| File Filter
|--------------------------------------------------------------------------
*/

const fileFilter = (req, file, cb) => {

    const allowedMimeTypes = [

        "image/jpeg",

        "image/png",

        "image/webp",

        "image/jpg"

    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {

        return cb(

            new ApiError(

                400,

                "Only JPG, JPEG, PNG and WEBP images are allowed."

            )

        );

    }

    cb(null, true);

};

/*
|--------------------------------------------------------------------------
| Multer Upload
|--------------------------------------------------------------------------
*/

const upload = multer({

    storage,

    fileFilter,

    limits: {

        fileSize: 5 * 1024 * 1024,

        files: 5

    }

});

export default upload;