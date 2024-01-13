import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Server } from 'ws';
import { Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  CallCenterEvent,
  CallCenterEventData,
  CallCenterMessage,
} from './callCenter.dto';
import { WsCallCenterGuard } from '../../guards/auth.call-center.ws.guard';
import * as jwt from 'jsonwebtoken';
import { OnEvent } from '@nestjs/event-emitter';
import {
  EmergencyAskAssignEvent,
  EmergencyAssignedEvent,
  EmergencyCanceledEvent,
  EmergencyCreatedEvent,
  EmergencyRefusedEvent,
  EmergencyTerminatedEvent,
  EventType,
} from '../../services/emergency-manager/emergencyManager.dto';

@WebSocketGateway({ namespace: '/call-center/ws' })
export class CallCenterWebsocket
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger: Logger = new Logger(CallCenterWebsocket.name);
  public static clients: Map<Types.ObjectId, Socket> = new Map<
    Types.ObjectId,
    Socket
  >();

  @WebSocketServer()
  server: Server;

  @UseGuards(WsCallCenterGuard)
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): any {
    // Traiter le message reçu et éventuellement répondre
    this.logger.log('New message from client: ' + client.id + ' - ' + payload);
    return new CallCenterMessage({
      message: 'coucou',
    });
  }

  handleConnection(@ConnectedSocket() client: Socket): any {
    this.logger.log('Call Center Client connected to server: ' + client.id);
    const token = client.handshake.query.token as string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        id: string;
        account: string;
      };
      if (decoded.account !== 'callCenter') {
        client.disconnect();
        return false;
      }
      CallCenterWebsocket.clients.set(new Types.ObjectId(decoded.id), client);
      return true;
    } catch (err) {
      this.logger.error(err);
      client.disconnect();
    }
  }

  handleDisconnect(client: any): any {
    this.logger.log('Client disconnected from server: ' + client.id);
    CallCenterWebsocket.clients.forEach((value, key) => {
      if (value.id === client.id) {
        CallCenterWebsocket.clients.delete(key);
      }
    });
  }

  afterInit() {
    this.logger.log('Call websocket server initialized');
  }

  getSocketWithId(id: Types.ObjectId): Socket | null {
    for (const [key, value] of CallCenterWebsocket.clients) {
      if (key.equals(id)) {
        return value;
      }
    }
    return null;
  }

  // Manage event

  @OnEvent(EventType.EMERGENCY_ASK_ASSIGN)
  handleEmergencyAskAssign(
    event: EmergencyAskAssignEvent,
  ): WsResponse<CallCenterEvent> {
    const socket = this.getSocketWithId(event.callCenter._id);
    if (!socket) {
      return;
    }
    const eventData: CallCenterEventData = {
      eventType: EventType.EMERGENCY_ASK_ASSIGN,
      callCenter: {
        id: event.callCenter._id.toHexString(),
        name: event.callCenter.name,
      },
      emergency: {
        id: event.emergency._id.toHexString(),
        info: event.emergency.info,
        position: {
          latitude: event.emergency.position.lat,
          longitude: event.emergency.position.long,
        },
        status: event.emergency.status,
      },
      rescuer: {
        id: event.rescuer._id.toHexString(),
        firstname: event.rescuer.firstname,
        lastname: event.rescuer.lastname,
        email: event.rescuer.email.email,
        phone: event.rescuer.phone.phone,
      },
    };
    const callCenterEvent = new CallCenterEvent(eventData);
    socket.emit(CallCenterEvent.channel, callCenterEvent);
  }

  @OnEvent(EventType.EMERGENCY_ASSIGNED)
  handleEmergencyAssigned(event: EmergencyAssignedEvent) {
    const socket = this.getSocketWithId(event.callCenter._id);
    if (!socket) {
      return;
    }
    const eventData: CallCenterEventData = {
      eventType: EventType.EMERGENCY_ASSIGNED,
      callCenter: {
        id: event.callCenter._id.toHexString(),
        name: event.callCenter.name,
      },
      emergency: {
        id: event.emergency._id.toHexString(),
        info: event.emergency.info,
        position: {
          latitude: event.emergency.position.lat,
          longitude: event.emergency.position.long,
        },
        status: event.emergency.status,
      },
      rescuer: {
        id: event.rescuer._id.toHexString(),
        firstname: event.rescuer.firstname,
        lastname: event.rescuer.lastname,
        email: event.rescuer.email.email,
        phone: event.rescuer.phone.phone,
      },
    };
    const callCenterEvent = new CallCenterEvent(eventData);
    socket.emit(CallCenterEvent.channel, callCenterEvent);
  }

  @OnEvent(EventType.EMERGENCY_CANCELED)
  handleEmergencyCanceled(event: EmergencyCanceledEvent) {
    const socket = this.getSocketWithId(event.callCenter._id);
    if (!socket) {
      return;
    }
    const eventData: CallCenterEventData = {
      eventType: EventType.EMERGENCY_CANCELED,
      callCenter: {
        id: event.callCenter._id.toHexString(),
        name: event.callCenter.name,
      },
      emergency: {
        id: event.emergency._id.toHexString(),
        info: event.emergency.info,
        position: {
          latitude: event.emergency.position.lat,
          longitude: event.emergency.position.long,
        },
        status: event.emergency.status,
      },
      rescuer: {
        id: event.rescuer._id.toHexString(),
        firstname: event.rescuer.firstname,
        lastname: event.rescuer.lastname,
        email: event.rescuer.email.email,
        phone: event.rescuer.phone.phone,
      },
    };
    const callCenterEvent = new CallCenterEvent(eventData);
    socket.emit(CallCenterEvent.channel, callCenterEvent);
  }

  @OnEvent(EventType.EMERGENCY_TERMINATED)
  handleEmergencyTerminated(event: EmergencyTerminatedEvent) {
    const socket = this.getSocketWithId(event.callCenter._id);
    if (!socket) {
      return;
    }
    const eventData: CallCenterEventData = {
      eventType: EventType.EMERGENCY_TERMINATED,
      callCenter: {
        id: event.callCenter._id.toHexString(),
        name: event.callCenter.name,
      },
      emergency: {
        id: event.emergency._id.toHexString(),
        info: event.emergency.info,
        position: {
          latitude: event.emergency.position.lat,
          longitude: event.emergency.position.long,
        },
        status: event.emergency.status,
      },
      rescuer: {
        id: event.rescuer._id.toHexString(),
        firstname: event.rescuer.firstname,
        lastname: event.rescuer.lastname,
        email: event.rescuer.email.email,
        phone: event.rescuer.phone.phone,
      },
    };
    const callCenterEvent = new CallCenterEvent(eventData);
    socket.emit(CallCenterEvent.channel, callCenterEvent);
  }

  @OnEvent(EventType.EMERGENCY_REFUSED)
  handleEmergencyRefused(event: EmergencyRefusedEvent) {
    const socket = this.getSocketWithId(event.callCenter._id);
    if (!socket) {
      return;
    }
    const eventData: CallCenterEventData = {
      eventType: EventType.EMERGENCY_REFUSED,
      callCenter: {
        id: event.callCenter._id.toHexString(),
        name: event.callCenter.name,
      },
      emergency: {
        id: event.emergency._id.toHexString(),
        info: event.emergency.info,
        position: {
          latitude: event.emergency.position.lat,
          longitude: event.emergency.position.long,
        },
        status: event.emergency.status,
      },
      rescuer: {
        id: event.rescuer._id.toHexString(),
        firstname: event.rescuer.firstname,
        lastname: event.rescuer.lastname,
        email: event.rescuer.email.email,
        phone: event.rescuer.phone.phone,
      },
    };
    const callCenterEvent = new CallCenterEvent(eventData);
    socket.emit(CallCenterEvent.channel, callCenterEvent);
  }

  @OnEvent(EventType.EMERGENCY_CREATED)
  handleEmergencyCreated(event: EmergencyCreatedEvent) {
    const socket = this.getSocketWithId(event.callCenter._id);
    if (!socket) {
      return;
    }
    const eventData: CallCenterEventData = {
      eventType: EventType.EMERGENCY_CREATED,
      callCenter: {
        id: event.callCenter._id.toHexString(),
        name: event.callCenter.name,
      },
      emergency: {
        id: event.emergency._id.toHexString(),
        info: event.emergency.info,
        position: {
          latitude: event.emergency.position.lat,
          longitude: event.emergency.position.long,
        },
        status: event.emergency.status,
      },
      rescuer: null,
    };
    const callCenterEvent = new CallCenterEvent(eventData);
    socket.emit(CallCenterEvent.channel, callCenterEvent);
  }
}
