import { Controller, Get, UseGuards } from '@nestjs/common';
import { Conversation } from '../../../database/conversation.schema';
import { Types } from 'mongoose';
import { RescuerAuthGuard } from '../../../guards/auth.route.guard';
import { ApiResponse } from '@nestjs/swagger';
import { ChatRescuerService } from './chat.rescuer.service';
import { Message } from '../../../database/message.schema';
import { UserId } from '../../../decorator/userid.decorator';

@Controller('rescuer/chat')
export class ChatRescuerController {
  constructor(private readonly chatService: ChatRescuerService) {}

  @UseGuards(RescuerAuthGuard)
  @Get('/conversations')
  @ApiResponse({
    status: 200,
    description: 'list of conversations of the user.',
  })
  async getConversations(
    @UserId() userId: Types.ObjectId,
  ): Promise<Conversation[]> {
    return this.chatService.getConversations(userId);
  }

  @UseGuards(RescuerAuthGuard)
  @Get('/messages')
  @ApiResponse({
    status: 200,
    description: 'list of messages of the conversation.',
  })
  async getMessages(conversationId: Types.ObjectId): Promise<Message[]> {
    return this.chatService.getMessages(conversationId);
  }
}
