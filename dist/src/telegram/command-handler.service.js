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
var CommandHandlerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandHandlerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const telegram_service_1 = require("./telegram.service");
let CommandHandlerService = CommandHandlerService_1 = class CommandHandlerService {
    prisma;
    telegramService;
    logger = new common_1.Logger(CommandHandlerService_1.name);
    constructor(prisma, telegramService) {
        this.prisma = prisma;
        this.telegramService = telegramService;
    }
    async handleCommand(message) {
        const chatId = String(message.chat.id);
        const userId = String(message.from.id);
        const text = message.text?.trim() || '';
        if (!text.startsWith('/')) {
            return;
        }
        const parts = text.split(' ');
        const command = parts[0].toLowerCase().replace('@', '');
        const args = parts.slice(1);
        this.logger.log(`📨 Command received: ${command} from user ${userId} in chat ${chatId}`);
        try {
            switch (command) {
                case '/start':
                    await this.handleStart(chatId);
                    break;
                case '/help':
                    await this.handleHelp(chatId);
                    break;
                case '/ban':
                    await this.handleBan(chatId, userId, args, message);
                    break;
                case '/unban':
                    await this.handleUnban(chatId, userId, args);
                    break;
                case '/kick':
                    await this.handleKick(chatId, userId, args, message);
                    break;
                case '/clean':
                    await this.handleClean(chatId, userId, args);
                    break;
                case '/report':
                    await this.handleReport(chatId, args);
                    break;
                default:
                    break;
            }
        }
        catch (error) {
            this.logger.error(`Failed to handle command ${command}: ${error.message}`, error.stack);
            await this.telegramService.sendMessage(chatId, `❌ Bir hata oluştu: ${error.message}`);
        }
    }
    async handleStart(chatId) {
        const welcomeMessage = `👋 Merhaba! Telegram Kanal Yönetim Botu'na hoş geldiniz.

/help komutu ile tüm komutları görebilirsiniz.`;
        await this.telegramService.sendMessage(chatId, welcomeMessage);
    }
    async handleHelp(chatId) {
        const helpMessage = `📚 **Komut Listesi**

👤 **Kullanıcı Yönetimi:**
/ban [user_id veya reply] - Kullanıcıyı yasakla
/unban [user_id] - Yasak kaldır
/kick [user_id veya reply] - Kullanıcıyı at

🗑️ **Mesaj Yönetimi:**
/clean [gün_sayısı] - Örn: /clean 30 (30 gün öncesi mesajları sil)

📈 **Sinyal Raporları:**
/report [mesaj_sayısı] - Örn: /report 100 (son 100 mesajda tekrar eden hisseler)

ℹ️ **Bilgi:**
/start - Hoş geldin mesajı
/help - Bu yardım mesajı

⚠️ **Not:** Ban, unban, kick ve clean komutları yalnızca yöneticiler tarafından kullanılabilir.`;
        await this.telegramService.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
    }
    async handleBan(chatId, userId, args, message) {
        const isAdmin = await this.telegramService.isUserAdmin(chatId, userId);
        if (!isAdmin) {
            await this.telegramService.sendMessage(chatId, '❌ Bu komutu kullanmak için yönetici olmalısınız.');
            return;
        }
        let targetUserId = null;
        let targetUsername = null;
        if (message.reply_to_message) {
            targetUserId = String(message.reply_to_message.from.id);
            targetUsername = message.reply_to_message.from.username || null;
        }
        else if (args.length > 0) {
            targetUserId = args[0];
        }
        if (!targetUserId) {
            await this.telegramService.sendMessage(chatId, '❌ Kullanım: /ban [user_id] veya bir mesajı yanıtlayarak /ban');
            return;
        }
        const channel = await this.prisma.channel.findUnique({
            where: { telegram_channel_id: chatId },
        });
        if (!channel) {
            await this.telegramService.sendMessage(chatId, '❌ Kanal veritabanında bulunamadı.');
            return;
        }
        await this.telegramService.banUser(chatId, targetUserId);
        await this.prisma.banned_user.upsert({
            where: {
                channel_id_user_id: {
                    channel_id: channel.id,
                    user_id: targetUserId,
                },
            },
            update: {},
            create: {
                channel_id: channel.id,
                user_id: targetUserId,
                username: targetUsername,
            },
        });
        await this.telegramService.sendMessage(chatId, `✅ Kullanıcı ${targetUsername || targetUserId} başarıyla yasaklandı.`);
        this.logger.log(`🚫 User ${targetUserId} banned in channel ${chatId}`);
    }
    async handleUnban(chatId, userId, args) {
        const isAdmin = await this.telegramService.isUserAdmin(chatId, userId);
        if (!isAdmin) {
            await this.telegramService.sendMessage(chatId, '❌ Bu komutu kullanmak için yönetici olmalısınız.');
            return;
        }
        if (args.length === 0) {
            await this.telegramService.sendMessage(chatId, '❌ Kullanım: /unban [user_id]');
            return;
        }
        const targetUserId = args[0];
        const channel = await this.prisma.channel.findUnique({
            where: { telegram_channel_id: chatId },
        });
        if (!channel) {
            await this.telegramService.sendMessage(chatId, '❌ Kanal veritabanında bulunamadı.');
            return;
        }
        await this.telegramService.unbanUser(chatId, targetUserId);
        await this.prisma.banned_user.deleteMany({
            where: {
                channel_id: channel.id,
                user_id: targetUserId,
            },
        });
        await this.telegramService.sendMessage(chatId, `✅ Kullanıcı ${targetUserId} yasak kaldırıldı.`);
        this.logger.log(`✅ User ${targetUserId} unbanned in channel ${chatId}`);
    }
    async handleKick(chatId, userId, args, message) {
        const isAdmin = await this.telegramService.isUserAdmin(chatId, userId);
        if (!isAdmin) {
            await this.telegramService.sendMessage(chatId, '❌ Bu komutu kullanmak için yönetici olmalısınız.');
            return;
        }
        let targetUserId = null;
        if (message.reply_to_message) {
            targetUserId = String(message.reply_to_message.from.id);
        }
        else if (args.length > 0) {
            targetUserId = args[0];
        }
        if (!targetUserId) {
            await this.telegramService.sendMessage(chatId, '❌ Kullanım: /kick [user_id] veya bir mesajı yanıtlayarak /kick');
            return;
        }
        await this.telegramService.kickUser(chatId, targetUserId);
        await this.telegramService.sendMessage(chatId, `✅ Kullanıcı ${targetUserId} kanaldan atıldı.`);
        this.logger.log(`🚪 User ${targetUserId} kicked from channel ${chatId}`);
    }
    async handleClean(chatId, userId, args) {
        const isAdmin = await this.telegramService.isUserAdmin(chatId, userId);
        if (!isAdmin) {
            await this.telegramService.sendMessage(chatId, '❌ Bu komutu kullanmak için yönetici olmalısınız.');
            return;
        }
        if (args.length === 0) {
            await this.telegramService.sendMessage(chatId, '❌ Kullanım: /clean [gün_sayısı]');
            return;
        }
        const days = parseInt(args[0], 10);
        if (isNaN(days) || days <= 0) {
            await this.telegramService.sendMessage(chatId, '❌ Geçersiz gün sayısı.');
            return;
        }
        const channel = await this.prisma.channel.findUnique({
            where: { telegram_channel_id: chatId },
        });
        if (!channel) {
            await this.telegramService.sendMessage(chatId, '❌ Kanal veritabanında bulunamadı.');
            return;
        }
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - days);
        const oldMessages = await this.prisma.message.findMany({
            where: {
                channel_id: channel.id,
                created_at: {
                    lt: thresholdDate,
                },
            },
            select: {
                telegram_message_id: true,
            },
        });
        if (oldMessages.length === 0) {
            await this.telegramService.sendMessage(chatId, `ℹ️ ${days} gün öncesine ait silinecek mesaj bulunamadı.`);
            return;
        }
        let deletedCount = 0;
        for (const msg of oldMessages) {
            const success = await this.telegramService.deleteMessage(chatId, msg.telegram_message_id);
            if (success) {
                deletedCount++;
            }
        }
        await this.prisma.message.deleteMany({
            where: {
                channel_id: channel.id,
                created_at: {
                    lt: thresholdDate,
                },
            },
        });
        await this.telegramService.sendMessage(chatId, `✅ ${deletedCount} adet mesaj başarıyla silindi (${days} gün öncesi).`);
        this.logger.log(`🗑️ Cleaned ${deletedCount} messages older than ${days} days in channel ${chatId}`);
    }
    async handleReport(chatId, args) {
        if (args.length === 0) {
            await this.telegramService.sendMessage(chatId, '❌ Kullanım: /report [mesaj_sayısı]');
            return;
        }
        const messageCount = parseInt(args[0], 10);
        if (isNaN(messageCount) || messageCount <= 0) {
            await this.telegramService.sendMessage(chatId, '❌ Geçersiz mesaj sayısı.');
            return;
        }
        const channel = await this.prisma.channel.findUnique({
            where: { telegram_channel_id: chatId },
        });
        if (!channel) {
            await this.telegramService.sendMessage(chatId, '❌ Kanal veritabanında bulunamadı.');
            return;
        }
        const recentMessages = await this.prisma.message.findMany({
            where: {
                channel_id: channel.id,
            },
            orderBy: {
                created_at: 'desc',
            },
            take: messageCount,
            select: {
                id: true,
            },
        });
        if (recentMessages.length === 0) {
            await this.telegramService.sendMessage(chatId, 'ℹ️ Henüz mesaj bulunamadı.');
            return;
        }
        const messageIds = recentMessages.map((m) => m.id);
        const signals = await this.prisma.signal.findMany({
            where: {
                message_id: {
                    in: messageIds,
                },
            },
            select: {
                symbol: true,
            },
        });
        if (signals.length === 0) {
            await this.telegramService.sendMessage(chatId, `ℹ️ Son ${messageCount} mesajda sinyal bulunamadı.`);
            return;
        }
        const symbolCount = {};
        for (const signal of signals) {
            symbolCount[signal.symbol] = (symbolCount[signal.symbol] || 0) + 1;
        }
        const sortedSymbols = Object.entries(symbolCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20);
        let report = `📈 **Son ${messageCount} mesajda tespit edilen hisseler:**\n\n`;
        for (const [symbol, count] of sortedSymbols) {
            report += `🔹 ${symbol}: ${count} kez\n`;
        }
        await this.telegramService.sendMessage(chatId, report, { parse_mode: 'Markdown' });
        this.logger.log(`📊 Report generated for channel ${chatId}: ${sortedSymbols.length} symbols`);
    }
};
exports.CommandHandlerService = CommandHandlerService;
exports.CommandHandlerService = CommandHandlerService = CommandHandlerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        telegram_service_1.TelegramService])
], CommandHandlerService);
//# sourceMappingURL=command-handler.service.js.map