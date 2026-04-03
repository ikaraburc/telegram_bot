import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramService } from './telegram.service';

@Injectable()
export class MessageProcessorService {
  private readonly logger = new Logger(MessageProcessorService.name);
  private bannedWordsCache: string[] = [];
  private lastCacheUpdate: number = 0;
  private readonly CACHE_TTL = 60000; // 1 minute

  constructor(
    private prisma: PrismaService,
    private telegramService: TelegramService,
  ) {}

  async processMessage(
    chatId: string,
    messageId: string,
    userId: string,
    text: string | null,
  ): Promise<void> {
    try {
      // Ensure channel exists
      const channel = await this.ensureChannel(chatId, 'Unknown Channel');

      // Check if user is banned
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

      // Save message to database
      const message = await this.prisma.message.create({
        data: {
          channel_id: channel.id,
          telegram_message_id: messageId,
          user_id: userId,
          text: text || null,
        },
      });

      // Check for profanity if text exists
      if (text) {
        const hasProfanity = await this.checkProfanity(text);
        if (hasProfanity) {
          this.logger.log(`🚨 Profanity detected in message ${messageId}`);
          await this.telegramService.deleteMessage(chatId, messageId);
          await this.telegramService.sendMessage(
            chatId,
            `⚠️ Lütfen kanal kurallarına uyun. Küfür ve argo kullanımı yasaktır.`,
          );
          return;
        }

        // Parse and save signals
        await this.parseSignals(text, channel.id, message.id);
      }
    } catch (error) {
      this.logger.error(`Failed to process message: ${error.message}`, error.stack);
    }
  }

  private async ensureChannel(telegramChannelId: string, title: string) {
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

  private async checkProfanity(text: string): Promise<boolean> {
    // Refresh cache if needed
    const now = Date.now();
    if (now - this.lastCacheUpdate > this.CACHE_TTL) {
      const words = await this.prisma.banned_word.findMany();
      this.bannedWordsCache = words.map((w) => w.word.toLowerCase());
      this.lastCacheUpdate = now;
    }

    // Normalize text: lowercase and remove special characters
    const normalizedText = text
      .toLowerCase()
      .replace(/[^a-zçğıöşü\s]/gi, ' ');

    // Check each banned word
    for (const bannedWord of this.bannedWordsCache) {
      // Match whole words or as part of compound words
      const regex = new RegExp(`\\b${bannedWord}\\b|${bannedWord}`, 'i');
      if (regex.test(normalizedText)) {
        return true;
      }
    }

    return false;
  }

  private async parseSignals(text: string, channelId: number, messageId: number): Promise<void> {
    // Regex to match #SYMBOL_USDT or #SYMBOL_USD patterns
    const signalRegex = /#([A-Z0-9_]+)/g;
    const matches = [...text.matchAll(signalRegex)];

    for (const match of matches) {
      const symbol = match[1];
      // Only save if it looks like a trading pair (contains _ and ends with USD or USDT)
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
        } catch (error) {
          // Ignore duplicate signals
          if (!error.message?.includes('Unique constraint')) {
            this.logger.error(`Failed to save signal ${symbol}: ${error.message}`);
          }
        }
      }
    }
  }
}
