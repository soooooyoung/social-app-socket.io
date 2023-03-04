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
  private readonly namespace = "/room";

  private onUpdateRoom = async (io: Server, roomId: number) => {
    // Announce Participants
    let users: string[] = [];

    const sockets = await io
      .of(this.namespace)
      .in([`room${roomId}`])
      .fetchSockets();

    for (const socket of sockets) {
      const user = this.users.get(socket.id);
      if (user) users.push(user);
    }
    io.of(this.namespace)
      .in([`room${roomId}`])
      .emit("participants", users);
  };

  @OnConnect()
  async connection(
    @ConnectedSocket() socket: Socket,
    @SocketQueryParam("roomId") roomId: number,
    @SocketQueryParam("username") username: string
  ) {
    await super.connection(socket, roomId, username);
    socket.emit("join");
  }

  //https://socket.io/docs/v4/emit-cheatsheet/
  @OnMessage("save")
  async save(
    @SocketIO() io: Server,
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
          time: new Date(),
          type: "message",
        };

        io.of("/room").to(`room${roomId}`).emit("message_success", newChatLog);
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
    logInfo(`${username} has left room${roomId}`);
    // Add Chat Log
    const newChatLog: ChatLog = {
      message: `${username} has left room${roomId}`,
      username,
      time: new Date(),
      type: "announcement",
    };

    this.onUpdateRoom(io, roomId);
    socket.to(`room${roomId}`).emit("leave_success", newChatLog);
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

      await this.onUpdateRoom(io, roomId);
      logInfo(`${username} has joined room${roomId}`);
    } catch (e) {
      logError(e);
      socket.emit("join_fail");
      socket.disconnect();
    }
  }
}
