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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const telegram_webhook_dto_1 = require("./dto/telegram-webhook.dto");
const message_processor_service_1 = require("./message-processor.service");
const command_handler_service_1 = require("./command-handler.service");
const swagger_1 = require("@nestjs/swagger");
let WebhookController = WebhookController_1 = class WebhookController {
    configService;
    messageProcessor;
    commandHandler;
    logger = new common_1.Logger(WebhookController_1.name);
    secretToken;
    constructor(configService, messageProcessor, commandHandler) {
        this.configService = configService;
        this.messageProcessor = messageProcessor;
        this.commandHandler = commandHandler;
        this.secretToken = this.configService.get('TELEGRAM_SECRET_TOKEN') || '';
    }
    async handleWebhook(secretTokenHeader, update) {
        if (this.secretToken && secretTokenHeader !== this.secretToken) {
            this.logger.warn('❌ Webhook request with invalid secret token');
            throw new common_1.UnauthorizedException('Invalid secret token');
        }
        this.logger.log(`📥 Webhook received: update_id=${update.update_id}`);
        try {
            const message = update.message || update.channel_post;
            if (!message) {
                return { ok: true };
            }
            const chatId = String(message.chat.id);
            const messageId = String(message.message_id);
            const userId = String(message.from.id);
            const text = message.text || null;
            if (text && text.startsWith('/')) {
                await this.commandHandler.handleCommand(message);
            }
            else {
                await this.messageProcessor.processMessage(chatId, messageId, userId, text);
            }
            return { ok: true };
        }
        catch (error) {
            this.logger.error(`Failed to process webhook: ${error.message}`, error.stack);
            return { ok: true };
        }
    }
};
exports.WebhookController = WebhookController;
__decorate([
    (0, common_1.Post)('telegram'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Telegram webhook endpoint' }),
    (0, swagger_1.ApiHeader)({ name: 'X-Telegram-Bot-Api-Secret-Token', required: false }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - invalid secret token' }),
    __param(0, (0, common_1.Headers)('x-telegram-bot-api-secret-token')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, telegram_webhook_dto_1.TelegramWebhookDto]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "handleWebhook", null);
exports.WebhookController = WebhookController = WebhookController_1 = __decorate([
    (0, swagger_1.ApiTags)('Webhook'),
    (0, common_1.Controller)('webhook'),
    __metadata("design:paramtypes", [config_1.ConfigService,
        message_processor_service_1.MessageProcessorService,
        command_handler_service_1.CommandHandlerService])
], WebhookController);
//# sourceMappingURL=webhook.controller.js.map