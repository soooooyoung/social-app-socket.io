import { BaseException } from "./BaseException";

export class NoResultException extends BaseException {
  constructor() {
    super("No Result");
  }
}
