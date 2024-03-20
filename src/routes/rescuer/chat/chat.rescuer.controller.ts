import { Controller, Get, UseGuards } from '@nestjs/common';
import { Conversation } from '../../../database/conversation.schema';
import { Types } from 'mongoose';
import { RescuerAuthGuard } from '../../../guards/auth.route.guard';
import { ApiResponse } from '@nestjs/swagger';
import { ChatRescuerService } from './chat.rescuer.service';

@Controller('rescuer/chat')
export class ChatRescuerController {
  constructor(private readonly chatService: ChatRescuerService) {}

  @UseGuards(RescuerAuthGuard)
  @Get('/conversations')
  @ApiResponse({
    status: 200,
    description: 'list of conversations of the user.',
  })
  async getConversations(userId: Types.ObjectId): Promise<Conversation[]> {
    return this.chatService.getConversations(userId);
  }

  @UseGuards(RescuerAuthGuard)
  @Get('/messages')
  @ApiResponse({
    status: 200,
    description: 'list of messages of the conversation.',
  })
  async getMessages(conversationId: Types.ObjectId): Promise<Conversation[]> {
    return this.chatService.getMessages(conversationId.);
  }
}
