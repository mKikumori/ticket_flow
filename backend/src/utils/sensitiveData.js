import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
} from "node:crypto";

const encryptionKey = Buffer.from(
  process.env.DATA_ENCRYPTION_KEY ?? "",
  "base64",
);

const hashSecret = process.env.DATA_HASH_SECRET;

if (encryptionKey.length !== 32) {
  throw new Error(
    "DATA_ENCRYPTION_KEY deve conter uma chave Base64 de 32 bytes.",
  );
}

if (!hashSecret || hashSecret.length < 32) {
  throw new Error(
    "DATA_HASH_SECRET deve ser configurado com um segredo forte.",
  );
}

// Remove pontuação, espaços e outros caracteres não numéricos.
export const normalizeSensitiveData = (value) => {
  if (typeof value !== "string" && typeof value !== "number") {
    throw new Error("O dado informado é inválido.");
  }

  const normalized = String(value).replace(/\D/g, "");

  if (!normalized) {
    throw new Error("O dado informado é inválido.");
  }

  return normalized;
};

// AES-256-GCM: criptografa o valor com um IV aleatório.
export const encryptSensitiveData = (value) => {
  const iv = randomBytes(12);

  const cipher = createCipheriv("aes-256-gcm", encryptionKey, iv);

  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return JSON.stringify({
    version: 1,
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  });
};

// Descriptografa e verifica a integridade/autenticidade.
export const decryptSensitiveData = (encryptedValue) => {
  const payload = JSON.parse(encryptedValue);

  if (
    payload.version !== 1 ||
    typeof payload.iv !== "string" ||
    typeof payload.authTag !== "string" ||
    typeof payload.ciphertext !== "string"
  ) {
    throw new Error("Formato de dado criptografado inválido.");
  }

  const iv = Buffer.from(payload.iv, "base64");
  const authTag = Buffer.from(payload.authTag, "base64");
  const ciphertext = Buffer.from(payload.ciphertext, "base64");

  if (iv.length !== 12 || authTag.length !== 16) {
    throw new Error("Parâmetros de criptografia inválidos.");
  }

  const decipher = createDecipheriv("aes-256-gcm", encryptionKey, iv);

  decipher.setAuthTag(authTag);

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return plaintext.toString("utf8");
};

// HMAC determinístico: permite consultar o banco por igualdade.
export const hashSensitiveData = (value) => {
  const normalized = normalizeSensitiveData(value);

  return createHmac("sha256", hashSecret)
    .update(normalized, "utf8")
    .digest("hex");
};
