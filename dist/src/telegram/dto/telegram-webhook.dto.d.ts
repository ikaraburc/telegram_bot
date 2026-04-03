export declare class TelegramUserDto {
    id: number;
    username?: string;
    first_name: string;
    last_name?: string;
}
export declare class TelegramChatDto {
    id: number;
    type: string;
    title?: string;
}
export declare class TelegramMessageEntityDto {
    type: string;
    offset: number;
    length: number;
}
export declare class TelegramMessageDto {
    message_id: number;
    from: TelegramUserDto;
    chat: TelegramChatDto;
    date: number;
    text?: string;
    entities?: TelegramMessageEntityDto[];
    reply_to_message?: TelegramMessageDto;
}
export declare class TelegramWebhookDto {
    update_id: number;
    message?: TelegramMessageDto;
    channel_post?: TelegramMessageDto;
}
