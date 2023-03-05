import { ChatLog } from "../models";
import {
  OnConnect,
  SocketController,
  ConnectedSocket,
  SocketQueryParam,
  EmitOnFail,
  OnMessage,
  SocketIO,
  MessageBody,
} from "socket-controllers";
import { Server, Socket } from "socket.io";
import { Service } from "typedi";
import { logError, logInfo } from "../utils/Logger";
import { BaseController } from "./BaseController";

@SocketController("/private")
@Service()
export class PrivateController extends BaseController {
  protected readonly namespace = "/private";

  @OnMessage("save")
  async save(
    @SocketIO() io: Server,
    @ConnectedSocket()
    socket: Socket,
    @SocketQueryParam("username") username: string,
    @MessageBody()
    { message, addressee }: { message: string; addressee?: string }
  ) {
    try {
      if (!addressee) {
        throw new Error("User Offline");
      }

      const newChatLog: ChatLog = {
        message,
        username,
        time: new Date(),
        type: "message",
      };

      io.of(this.namespace)
        .in([`${addressee}:${username}`, `${username}:${addressee}`])
        .emit("message_success", newChatLog);
    } catch (e) {
      console.log(e);
      logError(e);
    }
  }

  @OnMessage("join_private")
  async join(
    @SocketIO() io: Server,
    @ConnectedSocket() socket: Socket,
    @SocketQueryParam("username") username: string,
    @MessageBody() addressee: string
  ) {
    try {
      socket.join([`${addressee}:${username}`, `${username}:${addressee}`]);
      // Add Chat Log
      const newChatLog: ChatLog = {
        message: `${username} has joined`,
        username,
        time: new Date(),
        type: "announcement",
      };
      io.of(this.namespace)
        .in([`${addressee}:${username}`, `${username}:${addressee}`])
        .emit("join_success", newChatLog);
    } catch (e) {
      logError(e);
      socket.emit("join_fail");
      socket.disconnect();
    }
  }

  @OnMessage("leave_private")
  async leave(
    @SocketIO() io: Server,
    @ConnectedSocket() socket: Socket,
    @SocketQueryParam("username") username: string,
    @MessageBody() addressee: string
  ) {
    // leave Room
    socket.leave(`${addressee}:${username}`);
    socket.leave(`${username}:${addressee}`);

    // Add Chat Log
    const newChatLog: ChatLog = {
      message: `${username} has left`,
      username,
      time: new Date(),
      type: "announcement",
    };

    io.of(this.namespace)
      .in([`${addressee}:${username}`, `${username}:${addressee}`])
      .emit("leave_success", newChatLog);
  }
}
