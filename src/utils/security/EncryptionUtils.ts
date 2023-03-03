import * as crypto from "crypto";
import { env } from "../../configs/env";
import { IllegalStateException } from "../../exceptions";

export class EncryptionUtils {
  private SECRETKEY = env.utils.ENCRYPT_KEY_SECRET || "";
  private ALGORITHM: crypto.CipherGCMTypes = "aes-256-gcm";
  private SEPARATOR = ":";

  constructor() {}

  public encrypt = (data: string) => {
    if (!data) {
      throw new IllegalStateException("no data to encrypt");
    }

    try {
      const iv = this.getIv();
      const cipher: crypto.CipherGCM = crypto.createCipheriv(
        this.ALGORITHM,
        Buffer.from(this.SECRETKEY),
        iv
      );
      const encrypted = cipher.update(data);

      const finalBuffer = Buffer.concat([encrypted, cipher.final()]);
      const encryptedHex =
        iv.toString("hex") +
        this.SEPARATOR +
        finalBuffer.toString("hex") +
        this.SEPARATOR +
        cipher.getAuthTag().toString("hex");

      return encryptedHex;
    } catch (e) {
      throw new IllegalStateException("failed to encrypt: " + e);
    }
  };

  public decrypt = (data: string) => {
    if (!data) {
      throw new IllegalStateException("no data to decrypt");
    }

    try {
      const encryptedArray = data.split(this.SEPARATOR);
      const iv = Buffer.from(encryptedArray[0], "hex");
      const encrypted = Buffer.from(encryptedArray[1], "hex");
      const decipher: crypto.DecipherGCM = crypto.createDecipheriv(
        this.ALGORITHM,
        Buffer.from(this.SECRETKEY),
        iv
      );
      decipher.setAuthTag(Buffer.from(encryptedArray[2], "hex"));
      const decrypted = decipher.update(encrypted);
      const result = Buffer.concat([decrypted, decipher.final()]).toString();
      return result;
    } catch (e) {
      throw new IllegalStateException("failed to decrypt: " + e);
    }
  };

  private getIv = () => crypto.randomBytes(16);
}
