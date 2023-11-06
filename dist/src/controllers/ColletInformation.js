"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
router.post("/", (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const info = request.body;
        // Verificações básicas para garantir que os dados corretos foram enviados
        if (!info.hostname ||
            !info.platform ||
            !info.release ||
            !info.cpu ||
            typeof info.memoryTotal !== "number" || // Verificar se é um número, depois converta para BigInt
            typeof info.memoryFree !== "number" ||
            !info.UserInfo ||
            !info.macAddress) {
            return response.status(400).json({
                message: "Dados inválidos enviados",
                error: true,
            });
        }
        // Converta number para BigInt antes de salvá-los no banco de dados
        info.memoryTotal = String(info.memoryTotal);
        info.memoryFree = String(info.memoryFree);
        // Salvando as informações no banco de dados usando Prisma
        const machineInfo = yield prisma.machineInfo.create({
            data: {
                hostname: info.hostname,
                platform: info.platform,
                release: info.release,
                cpu: info.cpu,
                memoryTotal: info.memoryTotal,
                memoryFree: info.memoryFree,
                userInfo: info.UserInfo,
                macAddress: info.macAddress,
                ipAddress: info.ipv4Address,
                Disks: {
                    create: (info.Disks || []).map((disk) => ({
                        device: disk.Device,
                        size: BigInt(disk.Size),
                        used: BigInt(disk.Used),
                        available: BigInt(disk.Available),
                        capacity: disk.Capacity,
                    })),
                },
                InstalledApps: {
                    create: (info.installedApps || []).map((app) => ({
                        displayName: app.DisplayName,
                        displayIcon: app.DisplayIcon,
                        displayVersion: app.DisplayVersion || null,
                        installLocation: app.InstallLocation || null,
                        publisher: app.Publisher || null,
                        uninstallString: app.UninstallString || null,
                        otherDetails: Object.assign({}, app),
                    })),
                },
            },
        });
        response.status(201).json({
            message: "Data saved successfully",
            body: machineInfo,
            error: false,
        });
    }
    catch (error) {
        if (error.message &&
            error.message.includes("Unable to fit integer value")) {
            console.error("O valor é muito grande para ser inserido!");
            response.status(500).json({
                message: "O valor é muito grande para ser inserido!",
                error: true,
            });
        }
        else {
            console.error("Erro desconhecido:", error.message);
            response.status(500).json({
                message: "Erro desconhecido",
                error: true,
            });
        }
    }
}));
exports.default = router;
