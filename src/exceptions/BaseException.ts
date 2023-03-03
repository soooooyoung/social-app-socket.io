export class BaseException extends Error {
  public getMessage() {
    return this.message;
  }

  public getErrorCode() {
    return this.getErrorCode;
  }

  constructor(message?: string) {
    super();
    if (message) this.message = message;
  }
}
