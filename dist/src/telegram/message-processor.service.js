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
var MessageProcessorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageProcessorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const telegram_service_1 = require("./telegram.service");
let MessageProcessorService = MessageProcessorService_1 = class MessageProcessorService {
    prisma;
    telegramService;
    logger = new common_1.Logger(MessageProcessorService_1.name);
    bannedWordsCache = [];
    lastCacheUpdate = 0;
    CACHE_TTL = 60000;
    constructor(prisma, telegramService) {
        this.prisma = prisma;
        this.telegramService = telegramService;
    }
    async processMessage(chatId, messageId, userId, text) {
        try {
            const channel = await this.ensureChannel(chatId, 'Unknown Channel');
            const isBanned = await this.prisma.banned_user.findFirst({
                where: {
                    channel_id: channel.id,
                    user_id: userId,
                },
            });
            if (isBanned) {
                this.logger.log(`❌ Deleting message from banned user ${userId}`);
                await this.telegramService.deleteMessage(chatId, messageId);
                return;
            }
            const message = await this.prisma.message.create({
                data: {
                    channel_id: channel.id,
                    telegram_message_id: messageId,
                    user_id: userId,
                    text: text || null,
                },
            });
            if (text) {
                const hasProfanity = await this.checkProfanity(text);
                if (hasProfanity) {
                    this.logger.log(`🚨 Profanity detected in message ${messageId}`);
                    await this.telegramService.deleteMessage(chatId, messageId);
                    await this.telegramService.sendMessage(chatId, `⚠️ Lütfen kanal kurallarına uyun. Küfür ve argo kullanımı yasaktır.`);
                    return;
                }
                await this.parseSignals(text, channel.id, message.id);
            }
        }
        catch (error) {
            this.logger.error(`Failed to process message: ${error.message}`, error.stack);
        }
    }
    async ensureChannel(telegramChannelId, title) {
        let channel = await this.prisma.channel.findUnique({
            where: { telegram_channel_id: telegramChannelId },
        });
        if (!channel) {
            channel = await this.prisma.channel.create({
                data: {
                    telegram_channel_id: telegramChannelId,
                    title,
                },
            });
            this.logger.log(`✅ New channel registered: ${title} (${telegramChannelId})`);
        }
        return channel;
    }
    async checkProfanity(text) {
        const now = Date.now();
        if (now - this.lastCacheUpdate > this.CACHE_TTL) {
            const words = await this.prisma.banned_word.findMany();
            this.bannedWordsCache = words.map((w) => w.word.toLowerCase());
            this.lastCacheUpdate = now;
        }
        const normalizedText = text
            .toLowerCase()
            .replace(/[^a-zçğıöşü\s]/gi, ' ');
        for (const bannedWord of this.bannedWordsCache) {
            const regex = new RegExp(`\\b${bannedWord}\\b|${bannedWord}`, 'i');
            if (regex.test(normalizedText)) {
                return true;
            }
        }
        return false;
    }
    async parseSignals(text, channelId, messageId) {
        const signalRegex = /#([A-Z0-9_]+)/g;
        const matches = [...text.matchAll(signalRegex)];
        for (const match of matches) {
            const symbol = match[1];
            if (symbol.includes('_') && (symbol.endsWith('USDT') || symbol.endsWith('USD'))) {
                try {
                    await this.prisma.signal.create({
                        data: {
                            channel_id: channelId,
                            message_id: messageId,
                            symbol,
                        },
                    });
                    this.logger.log(`📈 Signal detected: ${symbol}`);
                }
                catch (error) {
                    if (!error.message?.includes('Unique constraint')) {
                        this.logger.error(`Failed to save signal ${symbol}: ${error.message}`);
                    }
                }
            }
        }
    }
};
exports.MessageProcessorService = MessageProcessorService;
exports.MessageProcessorService = MessageProcessorService = MessageProcessorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        telegram_service_1.TelegramService])
], MessageProcessorService);
//# sourceMappingURL=message-processor.service.js.map