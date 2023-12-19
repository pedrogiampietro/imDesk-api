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

const storageSignatures = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/signatures");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const storageTicketResponse = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/ticket_response");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const storageProviders = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/providers_logo");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const storageContracts = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/contracts_provider");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const uploadAvatars = multer({ storage: storageAvatars });
const uploadTickets = multer({ storage: storageTickets });
const uploadSignatures = multer({ storage: storageSignatures });
const uploadTicketResponse = multer({ storage: storageTicketResponse });
const uploadProviders = multer({ storage: storageProviders });
const uploadContracts = multer({ storage: storageContracts });

export {
  uploadAvatars,
  uploadTickets,
  uploadSignatures,
  uploadTicketResponse,
  uploadProviders,
  uploadContracts,
};
