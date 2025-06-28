import crypto from "crypto";

export const encryptId = (id) => {
  const key = process.env.ENCRYPTION_KEY;
  const iv = process.env.ENCRYPTION_IV;

  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(key),
    Buffer.from(iv)
  );
  let encrypted = cipher.update(id, "utf-8", "hex");
  encrypted += cipher.final("hex");

  return encrypted;
};
