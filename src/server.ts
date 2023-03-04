import { Server } from "socket.io";
import { createServer } from "http";
import { socketControllerOptions } from "./configs/SocketConfig";
import { SocketControllers } from "socket-controllers";
import { logError, logInfo } from "./utils/Logger";

export class DokiSocketServer {
  public PORT: number = Number(process.env.PORT) || 9000;

  /**
   * Start server.
   */
  public async startServer(): Promise<void> {
    const server = createServer();
    const io = new Server(server, {
      path: "/ws/",
      cors: {
        origin: ["https://snsus.click", "http://localhost:3000"],
        credentials: true,
      },
    });

    new SocketControllers({
      ...socketControllerOptions,
      io,
    });

    return new Promise<void>((resolve, reject) => {
      server
        .listen(this.PORT, () => {
          console.log(`SERVER START ON PORT : ${this.PORT}`);
          return resolve();
        })
        .on("error", (e) => {
          logError(e);
          return reject(e);
        });
    });
  }
}
