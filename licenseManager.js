/**
 * SimpleCRM Pro Licensing Engine (Lemon Squeezy + Web Crypto HMAC)
 */
const LicenseManager = {
  // App-specific internal salt to sign local validation payloads
  // (In production, replace with your own unique string)
  INTERNAL_SALT: "SimpleCRM_Pro_SecretSalt_#9843!v1.9",
  CHECK_INTERVAL_DAYS: 7,
  GRACE_PERIOD_HOURS: 48,

  // 1. Generate or retrieve an installation UUID
  getInstallationId() {
    if (!appState.installationId) {
      appState.installationId = 'sc_' + crypto.randomUUID();
      saveState();
    }
    return appState.installationId;
  },

  // 2. Compute an HMAC-SHA256 integrity signature
  async generateIntegritySignature(licenseKey, expiryTimestamp) {
    const encoder = new TextEncoder();
    const secretKeyData = encoder.encode(this.INTERNAL_SALT);
    const message = `${licenseKey}::${this.getInstallationId()}::${expiryTimestamp}`;

    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      secretKeyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureBuffer = await window.crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      encoder.encode(message)
    );

    return Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },

  // 3. Verify Local Signature (Anti-Tamper Check)
  async verifyLocalIntegrity() {
    if (!appState.license || !appState.license.key || !appState.license.signature) {
      return false;
    }

    const expectedSignature = await this.generateIntegritySignature(
      appState.license.key,
      appState.license.expiry
    );

    // Constant-time check equivalent to avoid simple flag injection
    return expectedSignature === appState.license.signature;
  },

  // 4. Activate License (First-Time Verification)
  async activateLicense(licenseKey) {
    const cleanKey = licenseKey.trim();
    if (!cleanKey) throw new Error("Please enter a valid license key.");

    const instanceName = `Browser Extension (${this.getInstallationId().substring(0, 8)})`;

    const response = await fetch("https://api.lemonsqueezy.com/v1/licenses/activate", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        license_key: cleanKey,
        instance_name: instanceName
      })
    });

    if (!response.ok) {
      throw new Error(`Activation request failed with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.activated === true && (data.license_key?.status === "active" || data.license_key?.status === "trialing")) {
      const now = Date.now();
      const nextCheck = now + (this.CHECK_INTERVAL_DAYS * 24 * 60 * 60 * 1000);

      const signature = await this.generateIntegritySignature(cleanKey, nextCheck);

      appState.license = {
        key: cleanKey,
        status: data.license_key.status,
        customerEmail: data.meta?.customer_email || "",
        instanceId: data.instance?.id || "",
        lastChecked: now,
        expiry: nextCheck,
        signature: signature
      };

      saveState();
      return { success: true, email: appState.license.customerEmail };
    } else {
      const msg = data.error || "License is invalid, expired, or deactivated.";
      throw new Error(msg);
    }
  },

  // 5. Periodic 7-Day Background Heartbeat Verification
  async checkLicenseHeartbeat() {
    // If no license configured, stay in free tier
    if (!appState.license || !appState.license.key) {
      return false;
    }

    // Anti-tamper check: If localStorage signature doesn't match, revoke immediately
    const isValidSignature = await this.verifyLocalIntegrity();
    if (!isValidSignature) {
      console.warn("SimpleCRM: Local integrity check failed. Revoking Pro access.");
      this.revokeProAccess();
      return false;
    }

    const now = Date.now();
    const intervalMs = this.CHECK_INTERVAL_DAYS * 24 * 60 * 60 * 1000;
    const graceMs = this.GRACE_PERIOD_HOURS * 60 * 60 * 1000;

    // Check if 7 days have passed since the last remote validation
    if (now - (appState.license.lastChecked || 0) < intervalMs) {
      return true; // Still within valid 7-day window
    }

    // 7 days elapsed — attempt remote validation
    try {
      const response = await fetch("https://api.lemonsqueezy.com/v1/licenses/validate", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          license_key: appState.license.key,
          instance_id: appState.license.instanceId || ""
        })
      });

      if (response.ok) {
        const data = await response.json();
        const status = data.license_key?.status;

        if (data.valid === true && (status === "active" || status === "trialing")) {
          // Subscription is alive and healthy: update heartbeat and re-sign
          const nextCheck = now + intervalMs;
          appState.license.lastChecked = now;
          appState.license.expiry = nextCheck;
          appState.license.status = status;
          appState.license.signature = await this.generateIntegritySignature(appState.license.key, nextCheck);
          saveState();
          return true;
        } else {
          // Subscription cancelled, refunded, or expired
          console.warn(`SimpleCRM: License status is '${status}'. Revoking Pro access.`);
          this.revokeProAccess();
          return false;
        }
      } else {
        throw new Error(`Server returned ${response.status}`);
      }
    } catch (networkError) {
      // Offline fallback: check if user is within the 48-hour grace window
      const timeSinceExpiry = now - appState.license.expiry;
      if (timeSinceExpiry < graceMs) {
        console.warn("SimpleCRM: Background re-verification failed due to network; operating within 48h grace period.");
        return true;
      } else {
        console.warn("SimpleCRM: 48h grace period expired without re-verification. Revoking Pro access.");
        this.revokeProAccess();
        return false;
      }
    }
  },

  // 6. Revoke Pro privileges safely
  revokeProAccess() {
    appState.license = null;
    appState.autoSyncDrive = false;
    saveState();
    updateProUI();
  },

  // 7. Check if Pro features are currently unlocked
  async isProActive() {
    return await this.checkLicenseHeartbeat();
  }
};