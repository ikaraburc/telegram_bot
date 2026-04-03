import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly botToken: string;

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN environment variable is required');
    }
    this.botToken = token;

    this.axiosInstance = axios.create({
      baseURL: `https://api.telegram.org/bot${this.botToken}`,
      timeout: 10000,
    });
  }

  async sendMessage(chatId: string | number, text: string, options?: any): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/sendMessage', {
        chat_id: chatId,
        text,
        ...options,
      });
      return response.data.result;
    } catch (error) {
      this.logger.error(`Failed to send message to ${chatId}: ${error.message}`);
      throw error;
    }
  }

  async deleteMessage(chatId: string | number, messageId: string | number): Promise<boolean> {
    try {
      const response = await this.axiosInstance.post('/deleteMessage', {
        chat_id: chatId,
        message_id: messageId,
      });
      return response.data.result;
    } catch (error) {
      this.logger.error(`Failed to delete message ${messageId} in ${chatId}: ${error.message}`);
      return false;
    }
  }

  async banUser(chatId: string | number, userId: string | number): Promise<boolean> {
    try {
      const response = await this.axiosInstance.post('/banChatMember', {
        chat_id: chatId,
        user_id: userId,
      });
      return response.data.result;
    } catch (error) {
      this.logger.error(`Failed to ban user ${userId} in ${chatId}: ${error.message}`);
      throw error;
    }
  }

  async unbanUser(chatId: string | number, userId: string | number): Promise<boolean> {
    try {
      const response = await this.axiosInstance.post('/unbanChatMember', {
        chat_id: chatId,
        user_id: userId,
        only_if_banned: true,
      });
      return response.data.result;
    } catch (error) {
      this.logger.error(`Failed to unban user ${userId} in ${chatId}: ${error.message}`);
      throw error;
    }
  }

  async kickUser(chatId: string | number, userId: string | number): Promise<boolean> {
    try {
      // Ban and immediately unban to kick
      await this.axiosInstance.post('/banChatMember', {
        chat_id: chatId,
        user_id: userId,
      });
      await this.axiosInstance.post('/unbanChatMember', {
        chat_id: chatId,
        user_id: userId,
      });
      return true;
    } catch (error) {
      this.logger.error(`Failed to kick user ${userId} in ${chatId}: ${error.message}`);
      throw error;
    }
  }

  async getChatAdministrators(chatId: string | number): Promise<any[]> {
    try {
      const response = await this.axiosInstance.post('/getChatAdministrators', {
        chat_id: chatId,
      });
      return response.data.result;
    } catch (error) {
      this.logger.error(`Failed to get admins for ${chatId}: ${error.message}`);
      throw error;
    }
  }

  async isUserAdmin(chatId: string | number, userId: string | number): Promise<boolean> {
    try {
      const admins = await this.getChatAdministrators(chatId);
      return admins.some((admin) => admin.user.id === Number(userId));
    } catch (error) {
      this.logger.error(`Failed to check admin status for user ${userId}: ${error.message}`);
      return false;
    }
  }

  async setWebhook(url: string, secretToken?: string): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/setWebhook', {
        url,
        secret_token: secretToken,
        allowed_updates: ['message', 'channel_post'],
      });
      this.logger.log(`Webhook set to: ${url}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to set webhook: ${error.message}`);
      throw error;
    }
  }

  async getWebhookInfo(): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/getWebhookInfo');
      return response.data.result;
    } catch (error) {
      this.logger.error(`Failed to get webhook info: ${error.message}`);
      throw error;
    }
  }
}
