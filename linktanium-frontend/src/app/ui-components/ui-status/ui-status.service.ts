import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

export type StatusType = "loading" | "success" | "error";

@Injectable({
  providedIn: "root",
})
export class StatusMessageService {
  private _message = new BehaviorSubject<string | null>(null);
  private _status = new BehaviorSubject<StatusType>("loading");

  readonly message$ = this._message.asObservable();
  readonly status$ = this._status.asObservable();

  private persistentMessage: string | null = null;
  private persistentStatus: StatusType = "success";

  private lastShownTimestamp: number | null = null;
  private clearTimeoutRef: any;

  private readonly MIN_DISPLAY_MS = 500;
  private readonly AUTO_CLEAR_MS = 3000;

  show(
    message: string,
    status: StatusType = "loading",
    persistent = false,
    customDurationMs?: number
  ) {
    this._message.next(message);
    this._status.next(status);
    this.lastShownTimestamp = Date.now();

    if (persistent) {
      this.persistentMessage = message;
      this.persistentStatus = status;
    }

    clearTimeout(this.clearTimeoutRef);

    const timeout =
      status === "loading"
        ? customDurationMs ?? this.AUTO_CLEAR_MS
        : customDurationMs ?? 2000;

    this.clearTimeoutRef = setTimeout(() => this.clear(), timeout);
  }

  clear() {
    const elapsed = Date.now() - (this.lastShownTimestamp ?? 0);

    if (elapsed < this.MIN_DISPLAY_MS) {
      const delay = this.MIN_DISPLAY_MS - elapsed;
      setTimeout(() => this._doClear(), delay);
    } else {
      this._doClear();
    }
  }

  private _doClear() {
    if (this.persistentMessage) {
      // Restore persistent message
      this._message.next(this.persistentMessage);
      this._status.next(this.persistentStatus);
    } else {
      this._message.next(null);
    }
  }

  clearPersistent() {
    this.persistentMessage = null;
    this.persistentStatus = "success";
  }

  showDebug(
    message: string = "Debug status test",
    status: StatusType = "loading"
  ) {
    this.show(message, status);
  }
}
