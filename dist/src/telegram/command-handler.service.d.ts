import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from './telegram.service';
import { TelegramMessageDto } from './dto/telegram-webhook.dto';
export declare class CommandHandlerService {
    private prisma;
    private telegramService;
    private readonly logger;
    constructor(prisma: PrismaService, telegramService: TelegramService);
    handleCommand(message: TelegramMessageDto): Promise<void>;
    private handleStart;
    private handleHelp;
    private handleBan;
    private handleUnban;
    private handleKick;
    private handleClean;
    private handleReport;
}
