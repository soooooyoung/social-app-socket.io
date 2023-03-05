import { IllegalStateException } from "../exceptions";
import { ChatLog, User } from "../models";
import {
  SocketController,
  ConnectedSocket,
  MessageBody,
  OnMessage,
  SocketQueryParam,
  OnConnect,
  SocketIO,
} from "socket-controllers";
import { Server, Socket } from "socket.io";
import { Service } from "typedi";
import { BaseController } from "./BaseController";
import { logError, logInfo } from "../utils/Logger";

@SocketController("/room")
@Service()
export class ChatRoomController extends BaseController {
  protected readonly namespace = "/room";

  @OnMessage("save")
  async save(
    @SocketIO() io: Server,
    @ConnectedSocket()
    socket: Socket,
    @SocketQueryParam("roomId") roomId: number,
    @SocketQueryParam("username") username: string,
    @MessageBody()
    { message }: { message: string; addressee?: string }
  ) {
    try {
      if (socket.rooms.has(`room${roomId}`)) {
        const newChatLog: ChatLog = {
          message,
          username,
          time: new Date(),
          type: "message",
        };

        io.of(this.namespace)
          .in(`room${roomId}`)
          .emit("message_success", newChatLog);
      } else {
        throw new IllegalStateException("Invalid Room");
      }
    } catch (e) {
      logError(e);
      socket.emit("message_fail");
    }
  }

  @OnMessage("leave")
  async leave(
    @SocketIO() io: Server,
    @ConnectedSocket() socket: Socket,
    @SocketQueryParam("roomId") roomId: number,
    @SocketQueryParam("username") username: string
  ) {
    // leave Room
    socket.leave(`room${roomId}`);
    this.onUpdateRoom(io, `room${roomId}`);

    // Add Chat Log
    const newChatLog: ChatLog = {
      message: `${username} has left room${roomId}`,
      username,
      time: new Date(),
      type: "announcement",
    };
    socket.to(`room${roomId}`).emit("leave_success", newChatLog);

    logInfo(`${username} has left room${roomId}`);
  }

  @OnMessage("join")
  async join(
    @SocketIO() io: Server,
    @ConnectedSocket() socket: Socket,
    @SocketQueryParam("roomId") roomId: number,
    @SocketQueryParam("username") username: string
  ) {
    try {
      // Join Room
      socket.join(`room${roomId}`);
      await this.onUpdateRoom(io, `room${roomId}`);
      // Add Chat Log
      const newChatLog: ChatLog = {
        message: `${username} has joined room${roomId}`,
        username,
        time: new Date(),
        type: "announcement",
      };

      // Announce Join
      io.of(this.namespace)
        .in([`room${roomId}`])
        .emit("join_success", newChatLog);

      logInfo(`${username} has joined room${roomId}`);
    } catch (e) {
      logError(e);
      socket.emit("join_fail");
      socket.disconnect();
    }
  }
}
