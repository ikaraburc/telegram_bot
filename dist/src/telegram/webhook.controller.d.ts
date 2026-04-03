import { ConfigService } from '@nestjs/config';
import { TelegramWebhookDto } from './dto/telegram-webhook.dto';
import { MessageProcessorService } from './message-processor.service';
import { CommandHandlerService } from './command-handler.service';
export declare class WebhookController {
    private configService;
    private messageProcessor;
    private commandHandler;
    private readonly logger;
    private readonly secretToken;
    constructor(configService: ConfigService, messageProcessor: MessageProcessorService, commandHandler: CommandHandlerService);
    handleWebhook(secretTokenHeader: string, update: TelegramWebhookDto): Promise<{
        ok: boolean;
    }>;
}
