"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var TelegramService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let TelegramService = TelegramService_1 = class TelegramService {
    configService;
    logger = new common_1.Logger(TelegramService_1.name);
    axiosInstance;
    botToken;
    constructor(configService) {
        this.configService = configService;
        const token = this.configService.get('TELEGRAM_BOT_TOKEN');
        if (!token) {
            throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');
        }
        this.botToken = token;
        this.axiosInstance = axios_1.default.create({
            baseURL: `https://api.telegram.org/bot${this.botToken}`,
            timeout: 10000,
        });
    }
    async sendMessage(chatId, text, options) {
        try {
            const response = await this.axiosInstance.post('/sendMessage', {
                chat_id: chatId,
                text,
                ...options,
            });
            return response.data.result;
        }
        catch (error) {
            this.logger.error(`Failed to send message to ${chatId}: ${error.message}`);
            throw error;
        }
    }
    async deleteMessage(chatId, messageId) {
        try {
            const response = await this.axiosInstance.post('/deleteMessage', {
                chat_id: chatId,
                message_id: messageId,
            });
            return response.data.result;
        }
        catch (error) {
            this.logger.error(`Failed to delete message ${messageId} in ${chatId}: ${error.message}`);
            return false;
        }
    }
    async banUser(chatId, userId) {
        try {
            const response = await this.axiosInstance.post('/banChatMember', {
                chat_id: chatId,
                user_id: userId,
            });
            return response.data.result;
        }
        catch (error) {
            this.logger.error(`Failed to ban user ${userId} in ${chatId}: ${error.message}`);
            throw error;
        }
    }
    async unbanUser(chatId, userId) {
        try {
            const response = await this.axiosInstance.post('/unbanChatMember', {
                chat_id: chatId,
                user_id: userId,
                only_if_banned: true,
            });
            return response.data.result;
        }
        catch (error) {
            this.logger.error(`Failed to unban user ${userId} in ${chatId}: ${error.message}`);
            throw error;
        }
    }
    async kickUser(chatId, userId) {
        try {
            await this.axiosInstance.post('/banChatMember', {
                chat_id: chatId,
                user_id: userId,
            });
            await this.axiosInstance.post('/unbanChatMember', {
                chat_id: chatId,
                user_id: userId,
            });
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to kick user ${userId} in ${chatId}: ${error.message}`);
            throw error;
        }
    }
    async getChatAdministrators(chatId) {
        try {
            const response = await this.axiosInstance.post('/getChatAdministrators', {
                chat_id: chatId,
            });
            return response.data.result;
        }
        catch (error) {
            this.logger.error(`Failed to get admins for ${chatId}: ${error.message}`);
            throw error;
        }
    }
    async isUserAdmin(chatId, userId) {
        try {
            const admins = await this.getChatAdministrators(chatId);
            return admins.some((admin) => admin.user.id === Number(userId));
        }
        catch (error) {
            this.logger.error(`Failed to check admin status for user ${userId}: ${error.message}`);
            return false;
        }
    }
    async setWebhook(url, secretToken) {
        try {
            const response = await this.axiosInstance.post('/setWebhook', {
                url,
                secret_token: secretToken,
                allowed_updates: ['message', 'channel_post'],
            });
            this.logger.log(`Webhook set to: ${url}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Failed to set webhook: ${error.message}`);
            throw error;
        }
    }
    async getWebhookInfo() {
        try {
            const response = await this.axiosInstance.post('/getWebhookInfo');
            return response.data.result;
        }
        catch (error) {
            this.logger.error(`Failed to get webhook info: ${error.message}`);
            throw error;
        }
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = TelegramService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], TelegramService);
//# sourceMappingURL=telegram.service.js.map