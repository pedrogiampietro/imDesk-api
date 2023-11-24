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
exports.closeTicketNotificationDiscord = exports.updateTicketNotificationDiscord = exports.createTicketNotificationDiscord = void 0;
const axios_1 = __importDefault(require("axios"));
const discordWebhookUrl = 'https://discord.com/api/webhooks/1174072323800846426/JmR3b3Uemc0gaNGZ1cfNkmU24ZqjuLxAG6OWpwDwPgwtRXIxdUojEO2yO02He8etYTEr';
function createTicketNotificationDiscord(ticketInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        const mensagemDiscord = {
            embeds: [
                {
                    title: '🎟️ Novo Chamado Aberto',
                    color: 3447003,
                    fields: [
                        {
                            name: '📝 Descrição',
                            value: ticketInfo.description,
                        },
                        {
                            name: '🔺 Prioridade',
                            value: ticketInfo.ticketPriority.name,
                        },
                        {
                            name: '📍 Localização',
                            value: ticketInfo.ticketLocation.name,
                        },
                    ],
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: 'Sistema de Chamados',
                    },
                },
            ],
        };
        try {
            yield axios_1.default.post(discordWebhookUrl, mensagemDiscord);
            console.log('Notificação enviada para o Discord');
        }
        catch (error) {
            console.error('Erro ao enviar notificação para o Discord:', error);
        }
    });
}
exports.createTicketNotificationDiscord = createTicketNotificationDiscord;
function updateTicketNotificationDiscord(ticketInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        const mensagemDiscord = {
            embeds: [
                {
                    title: '🔄 Chamado Atualizado',
                    color: 16776960,
                    fields: [
                        {
                            name: '📝 Descrição',
                            value: ticketInfo.description,
                        },
                        {
                            name: '🔺 Prioridade',
                            value: ticketInfo.ticketPriority.name,
                        },
                    ],
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: 'Sistema de Chamados',
                    },
                },
            ],
        };
        try {
            yield axios_1.default.post(discordWebhookUrl, mensagemDiscord);
            console.log('Notificação de atualização enviada para o Discord');
        }
        catch (error) {
            console.error('Erro ao enviar notificação de atualização para o Discord:', error);
        }
    });
}
exports.updateTicketNotificationDiscord = updateTicketNotificationDiscord;
function closeTicketNotificationDiscord(ticketInfo) {
    return __awaiter(this, void 0, void 0, function* () {
        const mensagemDiscord = {
            embeds: [
                {
                    title: '✅ Chamado Fechado',
                    color: 65280,
                    fields: [
                        {
                            name: '📝 Descrição',
                            value: ticketInfo.description,
                        },
                        {
                            name: '🔺 Prioridade',
                            value: ticketInfo.ticketPriority.name,
                        },
                    ],
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: 'Sistema de Chamados',
                    },
                },
            ],
        };
        try {
            yield axios_1.default.post(discordWebhookUrl, mensagemDiscord);
            console.log('Notificação de fechamento enviada para o Discord');
        }
        catch (error) {
            console.error('Erro ao enviar notificação de fechamento para o Discord:', error);
        }
    });
}
exports.closeTicketNotificationDiscord = closeTicketNotificationDiscord;
