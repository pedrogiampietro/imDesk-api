import multer from "multer";
import path from "path";

const storageAvatars = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const storageTickets = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/tickets_img");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadAvatars = multer({ storage: storageAvatars });
const uploadTickets = multer({ storage: storageTickets });

export { uploadAvatars, uploadTickets };
