import { ConfigService } from '@nestjs/config';
export declare class TelegramService {
    private configService;
    private readonly logger;
    private readonly axiosInstance;
    private readonly botToken;
    constructor(configService: ConfigService);
    sendMessage(chatId: string | number, text: string, options?: any): Promise<any>;
    deleteMessage(chatId: string | number, messageId: string | number): Promise<boolean>;
    banUser(chatId: string | number, userId: string | number): Promise<boolean>;
    unbanUser(chatId: string | number, userId: string | number): Promise<boolean>;
    kickUser(chatId: string | number, userId: string | number): Promise<boolean>;
    getChatAdministrators(chatId: string | number): Promise<any[]>;
    isUserAdmin(chatId: string | number, userId: string | number): Promise<boolean>;
    setWebhook(url: string, secretToken?: string): Promise<any>;
    getWebhookInfo(): Promise<any>;
}
