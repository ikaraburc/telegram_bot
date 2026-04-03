import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { WebhookController } from './webhook.controller';
import { MessageProcessorService } from './message-processor.service';
import { CommandHandlerService } from './command-handler.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [WebhookController],
  providers: [
    TelegramService,
    MessageProcessorService,
    CommandHandlerService,
    PrismaService,
  ],
  exports: [TelegramService],
})
export class TelegramModule {}
