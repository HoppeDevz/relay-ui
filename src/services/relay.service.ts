import { isRelayRunning, readRelayConfig } from '../system/relay';

export class RelayService {
  async getRelayStatus() {
    return await isRelayRunning();
  }

  async getRelayConfig() {
    const config = await readRelayConfig();
    if (!config) {
      throw new Error('Config not found');
    }
    return config;
  }
}

export const relayService = new RelayService();
