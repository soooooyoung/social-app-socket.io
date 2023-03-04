import {
  OnConnect,
  SocketController,
  ConnectedSocket,
  OnDisconnect,
  MessageBody,
  OnMessage,
} from "socket-controllers";
import { Socket } from "socket.io";
import { Service } from "typedi";

@SocketController("/")
@Service()
export class BaseController {
  @OnConnect()
  connection(@ConnectedSocket() socket: Socket) {
    console.log("client connected");
  }

  @OnDisconnect()
  disconnect(@ConnectedSocket() socket: Socket) {
    console.log("client disconnected");
  }
}
