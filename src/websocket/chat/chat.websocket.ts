import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Socket } from 'socket.io';
import { Server } from 'ws';
import * as jwt from 'jsonwebtoken';
import { InjectModel } from '@nestjs/mongoose';
import { Message } from '../../database/message.schema';
import { Conversation } from '../../database/conversation.schema';

type ChatReceive = {
  conversationId: string;
  message: string;
};

@WebSocketGateway({ namespace: '/chat/ws' })
export class ChatWebsocket
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(Conversation.name)
    private conversationModel: Model<Conversation>,
  ) {}

  private readonly logger: Logger = new Logger(ChatWebsocket.name);
  public rescuerClients: Map<Types.ObjectId, Socket> = new Map<
    Types.ObjectId,
    Socket
  >();
  public callCenterClients: Map<Types.ObjectId, Socket> = new Map<
    Types.ObjectId,
    Socket
  >();

  @WebSocketServer()
  public server: Server;

  handleConnection(@ConnectedSocket() client: Socket): any {
    const token = client.handshake.query.token as string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        id: string;
        account: string;
      };
      if (decoded.account !== 'rescuer' && decoded.account !== 'callCenter') {
        client.disconnect();
        return;
      }
      if (decoded.account === 'rescuer') {
        this.rescuerClients.set(new Types.ObjectId(decoded.id), client);
        //join the client in a room with the id of the rescuer
        client.join(decoded.id);
        this.logger.log(`Rescuer ${decoded.id} connected.`);
      } else {
        this.callCenterClients.set(new Types.ObjectId(decoded.id), client);
        //join the client in a room with the id of the call center
        client.join(decoded.id);
        this.logger.log(`Call center ${decoded.id} connected.`);
      }
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: any): any {
    //search in the rescuerClients and callCenterClients maps and delete the client
    this.rescuerClients.forEach((value, key) => {
      if (value === client) {
        this.rescuerClients.delete(key);
        this.logger.log(`Rescuer ${key} disconnected.`);
      }
    });
    this.callCenterClients.forEach((value, key) => {
      if (value === client) {
        this.callCenterClients.delete(key);
        this.logger.log(`Call center ${key} disconnected.`);
      }
    });
  }

  afterInit() {
    this.logger.log('Chat websocket initialized.');
  }

  @SubscribeMessage('messageRescuer')
  async handleMessageRescuer(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    // Implement your message handling logic here
    this.logger.log(`Received message: ${JSON.stringify(data)} from client.`);
    //get the conversationId and message from the data
    const chatReceive: ChatReceive = data;
    if (!chatReceive.conversationId || !chatReceive.message) {
      return;
    }
    //get the ObjectId of the client
    let clientId = new Types.ObjectId();
    this.rescuerClients.forEach((value, key) => {
      if (value === client) {
        clientId = key;
      }
    });

    //create a message object in the database
    const message = new this.messageModel({
      conversationId: new Types.ObjectId(chatReceive.conversationId),
      senderId: clientId,
      content: chatReceive.message,
      timestamp: new Date(),
    });
    message.save();

    //get the call center associated with the conversation
    const conversation = await this.conversationModel.findById(
      chatReceive.conversationId,
    );
    if (!conversation) {
      return;
    }
    const callCenterId = conversation.callCenterId;
    //send the message to the call center
    this.rescuerClients.forEach((value, key) => {
      if (key.equals(clientId)) {
        this.logger.log(`Rescuer ${key} sent a message to call center.`);
        value.to(callCenterId.toString()).emit('messageRescuer', {
          conversationId: chatReceive.conversationId,
          message: chatReceive.message,
        });
      }
    });
  }

  @SubscribeMessage('messageCallCenter')
  async handleMessageCallCenter(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    // Implement your message handling logic here
    this.logger.log(`Received message: ${JSON.stringify(data)} from client.`);

    const chatReceive: ChatReceive = data;
    if (!chatReceive.conversationId || !chatReceive.message) {
      return;
    }
    //get the ObjectId of the client
    let clientId = new Types.ObjectId();
    this.callCenterClients.forEach((value, key) => {
      if (value === client) {
        clientId = key;
      }
    });

    //create a message object in the database
    const message = new this.messageModel({
      conversationId: new Types.ObjectId(chatReceive.conversationId),
      senderId: clientId,
      content: chatReceive.message,
      timestamp: new Date(),
    });
    message.save();

    const conversation = await this.conversationModel.findById(
      chatReceive.conversationId,
    );
    if (!conversation) {
      return;
    }
    const rescuerId = conversation.rescuerId;
    //send the message to the call center
    /* this.rescuerClients.forEach((value, key) => {
      if (key.equals(rescuerId)) {

        value.emit('messageCallCenter', {
          conversationId: chatReceive.conversationId,
          message: chatReceive.message,
        });
      }
    });*/
    // use rooms to send the message to the rescuer
    //get the callcenter associated with the conversation and his socket
    this.callCenterClients.forEach((value, key) => {
      if (key.equals(clientId)) {
        //send the message to the rescuer
        value.to(rescuerId.toString()).emit('messageCallCenter', {
          conversationId: chatReceive.conversationId,
          message: chatReceive.message,
        });
      }
    });
  }
}
