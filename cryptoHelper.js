/**
 * Web Crypto API Utility (AES-256-GCM + PBKDF2)
 * High-security client-side encryption for JSON exports/imports
 */

const CryptoEngine = {
  // Convert ArrayBuffer to Hex String
  bufToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },

  // Convert Hex String to Uint8Array
  hexToBuf(hexString) {
    const bytes = new Uint8Array(Math.ceil(hexString.length / 2));
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hexString.substr(i * 2, 2), 16);
    }
    return bytes;
  },

  // Derive AES-256-GCM Key using PBKDF2 (100,000 iterations, SHA-256)
  async deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  },

  // Encrypt Plaintext Data String with Password
  async encryptData(dataString, password) {
    const enc = new TextEncoder();
    const salt = window.crypto.getRandomValues(new Uint8Array(16)); // 16-byte random salt
    const iv = window.crypto.getRandomValues(new Uint8Array(12));   // 12-byte GCM IV

    const key = await this.deriveKey(password, salt);

    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      enc.encode(dataString)
    );

    return JSON.stringify({
      version: "AES-256-GCM-PBKDF2",
      salt: this.bufToHex(salt),
      iv: this.bufToHex(iv),
      ciphertext: this.bufToHex(ciphertextBuffer)
    }, null, 2);
  },

  // Decrypt Encrypted Payload Object with Password
  async decryptData(encryptedPayload, password) {
    const dec = new TextDecoder();
    
    // Parse payload if passed as string
    const payload = typeof encryptedPayload === 'string' ? JSON.parse(encryptedPayload) : encryptedPayload;
    
    if (!payload.salt || !payload.iv || !payload.ciphertext) {
      throw new Error("Invalid encrypted file payload format.");
    }

    const salt = this.hexToBuf(payload.salt);
    const iv = this.hexToBuf(payload.iv);
    const ciphertext = this.hexToBuf(payload.ciphertext);

    const key = await this.deriveKey(password, salt);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      ciphertext
    );

    return dec.decode(decryptedBuffer);
  }
};