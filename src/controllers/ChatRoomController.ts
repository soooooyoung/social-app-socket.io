import {
    OnConnect,
    SocketController,
    ConnectedSocket,
    OnDisconnect,
    MessageBody,
    OnMessage,
} from 'socket-controllers';
import { Socket } from 'socket.io';
import { Service } from 'typedi';
import { BaseController } from './BaseController';

@SocketController("/room/:roomId")
@Service()
export class ChatRoomController extends BaseController {
    @OnConnect()
    connection(@ConnectedSocket() socket: Socket) {
        console.log('client connected to chat room');
    }

    @OnDisconnect()
    disconnect(@ConnectedSocket() socket: Socket) {
        console.log('client disconnected from chat room');
    }

    @OnMessage('save')
    save(@ConnectedSocket() socket: Socket, @MessageBody() message: any) {
        console.log('received message:', message);
        console.log('setting id to the message and sending it back to the client');
        message.id = 1;
        socket.emit('message_saved', message);
    }
}