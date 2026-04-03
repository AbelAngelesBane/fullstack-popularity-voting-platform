import multer from "multer";
import type { FileFilterCallback } from "multer";
import path from "path";

// 1. Use Memory Storage instead of Disk Storage
const storage = multer.memoryStorage();

const fileFilter = (
    req: any, 
    file: Express.Multer.File, 
    cb: FileFilterCallback
): void => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const isExtValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const isMimeValid = allowedTypes.test(file.mimetype);

    if (isExtValid && isMimeValid) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed (jpeg, jpg, png, webp)"));
    }
};

export const upload = multer({
    storage, // Now using memory storage
    fileFilter,
    limits: { 
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1 
    }
});