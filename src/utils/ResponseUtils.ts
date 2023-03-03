import { BaseException } from "models/exceptions";
import { DokiResponse } from "models";

export class ResponseUtils {
  private response: DokiResponse = { success: false, result: {} };

  public validate = (status: boolean, error?: BaseException) => {
    this.response.success = status;
    this.response.error = error;
  };

  public put = (key: string, value: any) => {
    this.response.result[key] = value;
  };

  public get = (key: string) => {
    return this.response.result[key];
  };

  public getMono = () => {
    return this.response;
  };
}
