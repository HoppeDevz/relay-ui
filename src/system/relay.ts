import { promisify } from 'util';
import { exec as _exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const exec = promisify(_exec);

export async function isRelayRunning(): Promise<{ running: boolean; matches?: string[]; os: string; platform: string }> {
  const name = 'almaden-tcp-relay';
  const platform = process.platform;
  let osName = 'Unknown';
  
  if (platform === 'win32') {
    osName = 'Windows';
  } else if (platform === 'linux') {
    osName = 'Linux';
  } else if (platform === 'darwin') {
    osName = 'macOS';
  } else if (platform === 'sunos') {
    osName = 'Solaris';
  }
  
  try {
    if (platform === 'win32') {
      // tasklist outputs image names; run full tasklist and search
      const { stdout } = await exec('tasklist');
      const lines = stdout.split(/\r?\n/).filter(Boolean);
      const matches = lines.filter((l) => l.toLowerCase().includes(name));
      return { running: matches.length > 0, matches, os: osName, platform };
    } else {
      const { stdout } = await exec('ps -A');
      const lines = stdout.split(/\r?\n/).filter(Boolean);
      const matches = lines.filter((l) => l.toLowerCase().includes(name));
      return { running: matches.length > 0, matches, os: osName, platform };
    }
  } catch (err) {
    return { running: false, os: osName, platform };
  }
}

export async function readRelayConfig(): Promise<any> {
  const localAppData = process.env.LOCALAPPDATA || os.homedir();
  const cfgPath = path.join(localAppData, 'Almaden', 'tcp-relay-conf.json');
  try {
    const raw = await fs.readFile(cfgPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to read config at ${cfgPath}: ${err.message}`);
  }
}
