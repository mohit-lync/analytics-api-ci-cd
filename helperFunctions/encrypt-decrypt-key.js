const crypto = require("crypto");
const key = process.env.ENCRYPTION_KEY; // need to be 32 bits
const iv = crypto.randomBytes(16);

function encrypt() {
  const apikey = process.env.REACT_APP_API_KEY;
  const time = Date.now();

  let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  const originalText = `${apikey}$$${time}`;
  let encrypted = cipher.update(originalText);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${encrypted.toString("hex")}**${iv.toString("hex")}`;
}

// Decrypting text
function decrypt(text) {
  let iv = Buffer.from(text.iv, "hex");
  let encryptedText = Buffer.from(text.encryptedData, "hex");
  let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

module.exports = {
  decrypt,
  encrypt,
};
