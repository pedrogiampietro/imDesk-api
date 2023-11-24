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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.default = {
    logTicketCreation(userid) {
        console.log(`Usuário ${userid} abriu um ticket`);
        // adicionar código para salvar o log em um arquivo, banco de dados, etc.
    },
    logInventoryCreate(userid, name, quantity, deposit) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma.log.create({
                    data: {
                        userId: userid,
                        action: 'Adicionou um item',
                        details: `Adicionou um ${name} ao deposito ${deposit} com a quantidade ${quantity}.`,
                    },
                });
            }
            catch (err) {
                throw new Error('Erro ao salvar o log no banco de dados');
            }
        });
    },
    logInventoryUpdate(userid, name, quantityOld, quantityNew) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma.log.create({
                    data: {
                        userId: userid,
                        action: 'Atualizou Inventário',
                        details: `Atualizou o inventário do item ${name} da quantidade ${quantityOld} items para ${quantityNew}`,
                    },
                });
            }
            catch (err) {
                throw new Error('Erro ao salvar o log no banco de dados');
            }
        });
    },
    logTicketAssignment(userid, ticketId) {
        console.log(`Usuário ${userid} atribuiu um ticket ${ticketId}`);
        // adicionar código para salvar o log em um arquivo, banco de dados, etc.
    },
};
