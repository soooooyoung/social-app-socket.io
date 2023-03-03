import {
    OnConnect,
    SocketController,
    ConnectedSocket,
    OnDisconnect,
    MessageBody,
    OnMessage,
    SocketRequest,
    SocketQueryParam
} from 'socket-controllers';
import { Socket } from 'socket.io';
import { Service } from 'typedi';
import { BaseController } from './BaseController';

@SocketController("/room")
@Service()
export class ChatRoomController extends BaseController {
    @OnConnect()
    connection(@ConnectedSocket() socket: Socket,) {
        console.log('client connected to chat room');
    }

    @OnDisconnect()
    disconnect(@ConnectedSocket() socket: Socket) {
        console.log('client disconnected from chat room');
    }

    @OnMessage('save')
    save(@ConnectedSocket() socket: Socket, @MessageBody() message: any) {
        console.log("message received");
        socket.emit('message_saved', message);
    }


    @OnMessage('join')
    join(@ConnectedSocket() socket: Socket, @SocketQueryParam("roomId") roomId: number, @SocketQueryParam("name") name: string, @MessageBody() message: any) {

        socket.join(`room${roomId}`)
        console.log(`${name} joined room${roomId} `)
        socket.emit("join_success")


    }
}