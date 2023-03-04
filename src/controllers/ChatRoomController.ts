import { IllegalStateException } from "../exceptions";
import { ChatLog } from "../models";
import {
  OnConnect,
  SocketController,
  ConnectedSocket,
  OnDisconnect,
  MessageBody,
  OnMessage,
  SocketQueryParam,
} from "socket-controllers";
import { Socket } from "socket.io";
import { Service } from "typedi";
import { BaseController } from "./BaseController";

@SocketController("/room")
@Service()
export class ChatRoomController extends BaseController {
  @OnConnect()
  connection(@ConnectedSocket() socket: Socket) {
    console.log("client connected to chat room: ", socket.id);
  }

  @OnDisconnect()
  disconnect(@ConnectedSocket() socket: Socket) {
    console.log("client disconnected from chat room: ", socket.id);
  }

  //https://socket.io/docs/v3/emit-cheatsheet/
  @OnMessage("save")
  async save(
    @ConnectedSocket()
    socket: Socket,
    @SocketQueryParam("roomId") roomId: number,
    @SocketQueryParam("username") username: string,
    @MessageBody() message: string
  ) {
    try {
      if (socket.rooms.has(`room${roomId}`)) {
        const newChatLog: ChatLog = {
          message,
          username,
          time: new Date().toLocaleTimeString(),
        };

        // NOTE: cannot use io.in with current library- io instance unreachable.
        socket.emit("message_success", newChatLog);
        socket.to(`room${roomId}`).emit("message_success", newChatLog);
      } else {
        throw new IllegalStateException("Invalid Room");
      }
    } catch (e) {
      console.log("error");
      socket.emit("message_fail");
    }
  }

  @OnMessage("join")
  join(
    @ConnectedSocket() socket: Socket,
    @SocketQueryParam("roomId") roomId: number,
    @SocketQueryParam("username") username: string
  ) {
    try {
      console.log(`${username} joined room${roomId} `);
      socket.join(`room${roomId}`);
      socket.emit("join_success", roomId);
    } catch (e) {
      socket.emit("join_fail");
    }
  }
}
