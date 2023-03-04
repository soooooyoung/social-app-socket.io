import * as cookie from "cookie";
import { AuthTokenJWT } from "../models/JWTPayload";
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
import { TokenUtils } from "../utils/security/JWTTokenUtils";
import { InvalidKeyException } from "../exceptions";

@SocketController("/")
@Service()
export class BaseController {
  private jwt = new TokenUtils();
  private users: { username: string; socketId: string }[] = [];

  protected checkAuth = async (authToken: string) => {
    return await this.jwt.verifyToken<AuthTokenJWT>(authToken);
  };

  @OnConnect()
  async connection(
    @ConnectedSocket() socket: Socket,
    @SocketQueryParam("roomId") roomId: number,
    @SocketQueryParam("username") username: string
  ) {
    try {
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
        // Check duplicate connection
        if (this.users.find((user) => user.username === username)) {
          throw new Error("User already Joined");
        }

        const newUser = {
          socketId: socket.id,
          username,
        };

        this.users = [...this.users, newUser];
        console.log("client connected to chat room: ", socket.id);
      } else {
        throw new InvalidKeyException("Invalid Token");
      }
    } catch (e) {
      socket.emit("connect_fail", e);
      socket.disconnect();
    }
  }

  @OnDisconnect()
  disconnect(@ConnectedSocket() socket: Socket) {
    this.users = this.users.filter((user) => user.socketId !== socket.id);
    console.log("client disconnected from chat room: ", socket.id);
  }
}
