import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TelegramUserDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  username?: string;

  @IsString()
  first_name: string;

  @IsOptional()
  @IsString()
  last_name?: string;
}

export class TelegramChatDto {
  @IsNumber()
  id: number;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  title?: string;
}

export class TelegramMessageEntityDto {
  @IsString()
  type: string;

  @IsNumber()
  offset: number;

  @IsNumber()
  length: number;
}

export class TelegramMessageDto {
  @IsNumber()
  message_id: number;

  @ValidateNested()
  @Type(() => TelegramUserDto)
  from: TelegramUserDto;

  @ValidateNested()
  @Type(() => TelegramChatDto)
  chat: TelegramChatDto;

  @IsNumber()
  date: number;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TelegramMessageEntityDto)
  entities?: TelegramMessageEntityDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => TelegramMessageDto)
  reply_to_message?: TelegramMessageDto;
}

export class TelegramWebhookDto {
  @IsNumber()
  update_id: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => TelegramMessageDto)
  message?: TelegramMessageDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TelegramMessageDto)
  channel_post?: TelegramMessageDto;
}
