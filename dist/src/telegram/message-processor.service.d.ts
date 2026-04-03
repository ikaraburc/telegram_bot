import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from './telegram.service';
export declare class MessageProcessorService {
    private prisma;
    private telegramService;
    private readonly logger;
    private bannedWordsCache;
    private lastCacheUpdate;
    private readonly CACHE_TTL;
    constructor(prisma: PrismaService, telegramService: TelegramService);
    processMessage(chatId: string, messageId: string, userId: string, text: string | null): Promise<void>;
    private ensureChannel;
    private checkProfanity;
    private parseSignals;
}
