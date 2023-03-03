import { SocketControllersOptions } from "socket-controllers";
import Container from "typedi";

export const socketControllerOptions: SocketControllersOptions = {
  port: Number(process.env.PORT) || 9000,
  container: Container,
  controllers: [`${__dirname}/../controllers/*{.ts,.js}`],
};
