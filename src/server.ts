import { Server } from "socket.io";
import { createServer } from "http";
import { socketControllerOptions } from "./configs/SocketConfig";
import { SocketControllers } from "socket-controllers";


export class DokiSocketServer {
  public PORT: number = Number(process.env.PORT) || 9000;

  /**
   * Start server.
   */
  public async startServer(): Promise<void> {
    const server = createServer();
    const io = new Server(server,
      {
        cors: {
          origin: ["http://localhost:3000", "http://218.235.88.198:3000"],
          credentials: true,

        },
      });

    new SocketControllers({
      ...socketControllerOptions,
      io
    });

    return new Promise<void>((resolve, reject) => {
      server
        .listen(this.PORT, () => {
          console.log(`SERVER START ON PORT : ${this.PORT}`);
          return resolve();
        })
        .on("error", (e) => {
          console.log("SERVER START ERROR : ", e);
          return reject(e);
        });
    });

  }

}
