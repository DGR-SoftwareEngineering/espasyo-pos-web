/* eslint-disable @typescript-eslint/no-explicit-any */
class CashDrawerService {
  private _port: any = null;
  private _writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private _baudRate = 9600;
  private _kickPin = 2;

  configure(baudRate: number, kickPin: number): void {
    this._baudRate = baudRate;
    this._kickPin = kickPin;
  }

  isSupported(): boolean {
    return typeof window !== "undefined" && "serial" in navigator;
  }

  isConnected(): boolean {
    return this._port !== null && this._writer !== null;
  }

  async requestPort(): Promise<'connected' | 'cancelled' | 'failed'> {
    if (!this.isSupported()) return 'failed';
    try {
      await this._closeCurrentPort();
      const port = await (navigator as any).serial.requestPort();
      await port.open({ baudRate: this._baudRate });
      this._port = port;
      this._writer = port.writable.getWriter();
      return 'connected';
    } catch (err: any) {
      if (
        err?.name === 'NotFoundError' ||
        err?.name === 'NetworkError' ||
        err?.name === 'InvalidStateError'
      ) return 'cancelled';
      console.error("[CashDrawer] requestPort failed:", err);
      return 'failed';
    }
  }

  async reconnect(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const ports: any[] = await (navigator as any).serial.getPorts();
      if (ports.length === 0) return false;
      await this._closeCurrentPort();
      const port = ports[0];
      await port.open({ baudRate: this._baudRate });
      this._port = port;
      this._writer = port.writable.getWriter();
      return true;
    } catch (err: any) {
      if (
        err?.name === 'InvalidStateError' ||
        err?.name === 'NetworkError'
      ) return false;
      console.error("[CashDrawer] reconnect failed:", err);
      return false;
    }
  }

  async kickDrawer(): Promise<void> {
    if (!this._writer) {
      console.warn("[CashDrawer] kickDrawer called but not connected");
      return;
    }
    try {
      // Pin 2 → 0x00, Pin 5 → 0x01 (ESC/POS spec)
      const pinByte = this._kickPin === 5 ? 0x01 : 0x00;
      const cmd = new Uint8Array([0x1b, 0x70, pinByte, 0x19, 0xfa]);
      await this._writer.write(cmd);
    } catch (err) {
      console.error("[CashDrawer] kickDrawer failed:", err);
    }
  }

  async disconnect(): Promise<void> {
    await this._closeCurrentPort();
  }

  private async _closeCurrentPort(): Promise<void> {
    try {
      if (this._writer) {
        this._writer.releaseLock();
        this._writer = null;
      }
      if (this._port) {
        await this._port.close();
        this._port = null;
      }
    } catch {
      this._writer = null;
      this._port = null;
    }
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const cashDrawerService = new CashDrawerService();
