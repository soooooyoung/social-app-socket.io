import * as cookie from "cookie";
import { AuthTokenJWT } from "../models";
import {
  OnConnect,
  SocketController,
  ConnectedSocket,
  OnDisconnect,
  SocketQueryParam,
  EmitOnFail,
  SocketIO,
} from "socket-controllers";
import { Server, Socket } from "socket.io";
import { Service } from "typedi";
import { TokenUtils } from "../utils/security/JWTTokenUtils";
import { InvalidKeyException } from "../exceptions";
import { logError, logInfo } from "../utils/Logger";

@SocketController("/")
@Service()
export class BaseController {
  private jwt = new TokenUtils();
  protected readonly namespace: string = "";
  protected users = new Map<string, string>();
  protected checkAuth = async (authToken: string) => {
    return await this.jwt.verifyToken<AuthTokenJWT>(authToken);
  };
  protected onUpdateRoom = async (io: Server, roomname: string) => {
    // Announce Participants
    let users: string[] = [];

    const sockets = await io.of(this.namespace).in([roomname]).fetchSockets();

    for (const socket of sockets) {
      const user = this.users.get(socket.id);

      if (user) {
        // check duplicate
        if (users.find((v) => v === user)) {
          socket.disconnect();
          throw new Error("User Already Joined Room");
        } else {
          users.push(user);
        }
      }
    }
    io.of(this.namespace).in([roomname]).emit("participants", users);
  };

  @OnConnect()
  async connection(
    @SocketIO() io: Server,
    @ConnectedSocket() socket: Socket,
    @EmitOnFail("connect_fail")
    @SocketQueryParam("username")
    username: string
  ) {
    try {
      logInfo("client connection requested: ", socket.id);
      // Check cookies from header
      const cookies = socket.handshake.headers.cookie;
      if (!cookies) {
        throw new Error("Cookies Required");
      }

      // Parse authtoken from cookie
      const parsedToken = await this.checkAuth(cookie.parse(cookies).token);

      // Verify cookie with username
      if (
        parsedToken &&
        parsedToken.user &&
        parsedToken.user.username === username
      ) {
        this.users.set(socket.id, username);
        logInfo("client connected to chat room: ", socket.id);
      } else {
        throw new InvalidKeyException("Invalid Token");
      }
    } catch (e) {
      logError(e);
      socket.emit("connect_fail", e);
      socket.disconnect();
    }
  }

  @OnDisconnect()
  disconnect(@ConnectedSocket() socket: Socket) {
    this.users.delete(socket.id);
    logInfo("client disconnected from chat room: ", socket.id);
  }
}
