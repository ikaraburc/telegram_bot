"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramModule = void 0;
const common_1 = require("@nestjs/common");
const telegram_service_1 = require("./telegram.service");
const webhook_controller_1 = require("./webhook.controller");
const message_processor_service_1 = require("./message-processor.service");
const command_handler_service_1 = require("./command-handler.service");
const prisma_service_1 = require("../prisma/prisma.service");
let TelegramModule = class TelegramModule {
};
exports.TelegramModule = TelegramModule;
exports.TelegramModule = TelegramModule = __decorate([
    (0, common_1.Module)({
        controllers: [webhook_controller_1.WebhookController],
        providers: [
            telegram_service_1.TelegramService,
            message_processor_service_1.MessageProcessorService,
            command_handler_service_1.CommandHandlerService,
            prisma_service_1.PrismaService,
        ],
        exports: [telegram_service_1.TelegramService],
    })
], TelegramModule);
//# sourceMappingURL=telegram.module.js.map