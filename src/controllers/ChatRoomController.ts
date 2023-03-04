import { IllegalStateException } from "../exceptions";
import { ChatLog, User } from "../models";
import {
  SocketController,
  ConnectedSocket,
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
          type: "message",
        };

        // NOTE: cannot use io.in with current library- io instance unreachable.
        socket.emit("message_success", newChatLog);
        socket.to(`room${roomId}`).emit("message_success", newChatLog);
      } else {
        throw new IllegalStateException("Invalid Room");
      }
    } catch (e) {
      console.log(e);
      socket.emit("message_fail");
    }
  }

  @OnMessage("join")
  async join(
    @ConnectedSocket() socket: Socket,
    @SocketQueryParam("roomId") roomId: number,
    @SocketQueryParam("username") username: string
  ) {
    try {
      // Join Room
      socket.join(`room${roomId}`);

      // Add Chat Log
      const newChatLog: ChatLog = {
        message: `${username} has joined room${roomId}`,
        username,
        time: new Date().toLocaleTimeString(),
        type: "announcement",
      };

      // NOTE: cannot use io.in with current library- io instance unreachable.
      socket.emit("join_success", newChatLog);
      socket.to(`room${roomId}`).emit("join_success", newChatLog);
      console.log(`${username} has joined room${roomId}`);
    } catch (e) {
      console.log(e);
      socket.emit("join_fail");
      socket.disconnect();
    }
  }
}
