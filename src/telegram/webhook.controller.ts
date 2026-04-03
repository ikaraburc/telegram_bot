import {
  Controller,
  Post,
  Body,
  Headers,
  Logger,
  UnauthorizedException,
  HttpCode,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegramWebhookDto } from './dto/telegram-webhook.dto';
import { MessageProcessorService } from './message-processor.service';
import { CommandHandlerService } from './command-handler.service';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';

@ApiTags('Webhook')
@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);
  private readonly secretToken: string;

  constructor(
    private configService: ConfigService,
    private messageProcessor: MessageProcessorService,
    private commandHandler: CommandHandlerService,
  ) {
    this.secretToken = this.configService.get<string>('TELEGRAM_SECRET_TOKEN') || '';
  }

  @Post('telegram')
  @HttpCode(200)
  @ApiOperation({ summary: 'Telegram webhook endpoint' })
  @ApiHeader({ name: 'X-Telegram-Bot-Api-Secret-Token', required: false })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - invalid secret token' })
  async handleWebhook(
    @Headers('x-telegram-bot-api-secret-token') secretTokenHeader: string,
    @Body() update: TelegramWebhookDto,
  ): Promise<{ ok: boolean }> {
    // Verify secret token if configured
    if (this.secretToken && secretTokenHeader !== this.secretToken) {
      this.logger.warn('❌ Webhook request with invalid secret token');
      throw new UnauthorizedException('Invalid secret token');
    }

    this.logger.log(`📥 Webhook received: update_id=${update.update_id}`);

    try {
      // Handle regular messages or channel posts
      const message = update.message || update.channel_post;

      if (!message) {
        return { ok: true };
      }

      const chatId = String(message.chat.id);
      const messageId = String(message.message_id);
      const userId = String(message.from.id);
      const text = message.text || null;

      // Check if it's a command
      if (text && text.startsWith('/')) {
        await this.commandHandler.handleCommand(message);
      } else {
        // Process regular message
        await this.messageProcessor.processMessage(chatId, messageId, userId, text);
      }

      return { ok: true };
    } catch (error) {
      this.logger.error(`Failed to process webhook: ${error.message}`, error.stack);
      // Return ok: true to prevent Telegram from retrying
      return { ok: true };
    }
  }
}
