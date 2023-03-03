import * as express from "express";
import * as compression from "compression";
import * as bodyParser from "body-parser";
import { Server } from "socket.io";
import { SocketControllers } from "socket-controllers";
import { socketControllerOptions } from "./configs/SocketConfig";
import { createServer } from "http";


export class DokiSocketServer {
  public PORT: number = Number(process.env.PORT) || 9000;
  private readonly app: express.Application;


  constructor() {
    this.app = express();
    this.setConfig();
  }

  /**
   * Start server.
   */
  public async startServer(): Promise<void> {
    const io = new Server(createServer(this.app));

    new SocketControllers({
      ...socketControllerOptions,
      io
    })

    return new Promise<void>((resolve, reject) => {
      this.app
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

  /**
   * set express app config
   */
  private async setConfig() {
    this.app.use(compression());
    this.app.use(bodyParser.json({ limit: "50mb" }));
    this.app.use(
      bodyParser.urlencoded({
        limit: "50mb",
        extended: true,
        parameterLimit: 100000,
      })
    );
  }
}
