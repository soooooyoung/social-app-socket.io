import * as cookie from "cookie";
import { AuthTokenJWT } from "../models";
import {
  OnConnect,
  SocketController,
  ConnectedSocket,
  OnDisconnect,
  SocketQueryParam,
  EmitOnFail,
} from "socket-controllers";
import { Socket } from "socket.io";
import { Service } from "typedi";
import { TokenUtils } from "../utils/security/JWTTokenUtils";
import { InvalidKeyException } from "../exceptions";
import { logError, logInfo } from "../utils/Logger";

@SocketController("/")
@Service()
export class BaseController {
  private jwt = new TokenUtils();
  protected users = new Map<string, string>();
  protected checkAuth = async (authToken: string) => {
    return await this.jwt.verifyToken<AuthTokenJWT>(authToken);
  };

  @OnConnect()
  async connection(
    @ConnectedSocket() socket: Socket,
    @EmitOnFail("connect_fail")
    @SocketQueryParam("roomId")
    roomId: number,
    @SocketQueryParam("username") username: string
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
        // Check duplicate connection
        if ([...this.users.entries()].find(([k, v]) => v === username)) {
          throw new Error("User already Joined");
        }

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
