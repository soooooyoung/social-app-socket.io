import * as jwt from "jsonwebtoken";
import { logError } from "../../utils/Logger";
import { env } from "../../configs/env";
import {
  IllegalStateException,
  InvalidKeyException,
  NoResultException,
} from "../../exceptions";

export class TokenUtils {
  private accessTokenSecret = env.utils.JWT_TOKEN_SECRET || "";

  private doGenerateToken = async (
    payload: string | object,
    secret?: string,
    expiresIn?: string | number
  ) => {
    try {
      if (!secret) {
        throw new NoResultException();
      }
      if (expiresIn) return jwt.sign(payload, secret, { expiresIn });
      return jwt.sign(payload, secret);
    } catch (e) {
      logError(e);
      throw new IllegalStateException("Unable to generate Token: " + e);
    }
  };

  public generateToken = (
    payload: string | object,
    expiresIn?: string | number
  ) => {
    if (!payload) {
      throw new NoResultException();
    }
    return this.doGenerateToken(payload, this.accessTokenSecret, expiresIn);
  };

  public verifyToken = async <T>(token: string) => {
    try {
      return (await jwt.verify(token, this.accessTokenSecret)) as T;
    } catch (e) {
      logError(e);
      throw new InvalidKeyException("Invalid Token");
    }
  };
}
