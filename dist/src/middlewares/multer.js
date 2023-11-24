"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadTicketResponse = exports.uploadSignatures = exports.uploadTickets = exports.uploadAvatars = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storageAvatars = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/avatars');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const storageTickets = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/tickets_img');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const storageSignatures = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/signatures');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const storageTicketResponse = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/ticket_response');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
const uploadAvatars = (0, multer_1.default)({ storage: storageAvatars });
exports.uploadAvatars = uploadAvatars;
const uploadTickets = (0, multer_1.default)({ storage: storageTickets });
exports.uploadTickets = uploadTickets;
const uploadSignatures = (0, multer_1.default)({ storage: storageSignatures });
exports.uploadSignatures = uploadSignatures;
const uploadTicketResponse = (0, multer_1.default)({ storage: storageTicketResponse });
exports.uploadTicketResponse = uploadTicketResponse;
