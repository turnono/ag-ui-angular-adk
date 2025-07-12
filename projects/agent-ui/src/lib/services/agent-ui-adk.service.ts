import { Injectable } from '@angular/core';
import { Observable, Subject, Subscription, timer } from 'rxjs';
import { AGUIEvent } from '../ag-ui-event';

@Injectable({ providedIn: 'root' })
export class AgentUiAdkService {
  private abort?: AbortController;
  private url?: string;
  private payload?: unknown;
  private headers?: Record<string, string>;
  private reconnectAttempts = 0;
  private reconnectSub?: Subscription;
  private manualClose = false;
  private events$ = new Subject<AGUIEvent>();

  connect(
    url: string,
    payload?: unknown,
    headers?: Record<string, string>
  ): Observable<AGUIEvent> {
    this.disconnect();
    this.url = url;
    this.payload = payload;
    this.headers = headers;
    this.manualClose = false;
    this.events$ = new Subject<AGUIEvent>();
    this.openStream();
    return this.events$.asObservable();
  }

  disconnect(): void {
    this.manualClose = true;
    this.reconnectSub?.unsubscribe();
    this.abort?.abort();
    this.abort = undefined;
    this.events$.complete();
  }

  private async openStream(): Promise<void> {
    if (!this.url) return;
    this.abort = new AbortController();
    try {
      const res = await fetch(this.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
          ...this.headers
        },
        body: this.payload ? JSON.stringify(this.payload) : undefined,
        signal: this.abort.signal
      });

      if (!res.ok || !res.body) throw new Error('SSE connection failed');
      this.reconnectAttempts = 0;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let data = '';
      let doneFlag = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, idx).replace(/\r$/, '');
          buf = buf.slice(idx + 1);
          if (line === '') {
            if (data) {
              try {
                const parsed = JSON.parse(data);
                const event = this.toAgEvent(parsed);
                if (event) this.events$.next(event);
              } catch {
                // ignore malformed messages
              }
            }
            if (doneFlag) {
              this.disconnect();
              return;
            }
            data = '';
            doneFlag = false;
            continue;
          }
          if (line.startsWith('data:')) {
            data += line.slice(5).trim();
          } else if (line.startsWith('done:')) {
            doneFlag = line.slice(5).trim() === 'true';
          }
        }
      }
      if (!this.manualClose) this.scheduleReconnect();
    } catch {
      if (!this.manualClose) {
        this.scheduleReconnect();
      } else {
        this.events$.complete();
      }
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = Math.min(Math.pow(2, this.reconnectAttempts) * 1000, 30000);
    this.reconnectSub = timer(delay).subscribe(() => this.openStream());
  }

  private toAgEvent(adk: any): AGUIEvent | null {
    if (adk.type) {
      return adk as AGUIEvent;
    }
    if (adk.message || adk.text) {
      return { type: 'TEXT_MESSAGE_CONTENT', text: adk.message ?? adk.text };
    }
    if (adk.image || adk.image_url) {
      return { type: 'IMAGE_URL_CONTENT', url: adk.image ?? adk.image_url };
    }
    if (adk.button) {
      return {
        type: 'BUTTON_RESPONSE_REQUEST',
        label: adk.button.label,
        value: adk.button.value
      };
    }
    if (adk.tool) {
      return { type: 'TOOL_CALL_START', tool: adk.tool, args: adk.args };
    }
    if (adk.task_tree) {
      return { type: 'TASK_TREE_UPDATE', nodes: adk.task_tree };
    }
    return null;
  }
}
