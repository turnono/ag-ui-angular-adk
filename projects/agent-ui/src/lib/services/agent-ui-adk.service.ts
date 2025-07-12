import { Injectable } from '@angular/core';
import { Observable, Subject, Subscription, timer } from 'rxjs';
import { AGUIEvent } from '../ag-ui-event';

@Injectable({ providedIn: 'root' })
export class AgentUiAdkService {
  private source?: EventSource;
  private url?: string;
  private payload?: unknown;
  private reconnectAttempts = 0;
  private reconnectSub?: Subscription;
  private manualClose = false;
  private events$ = new Subject<AGUIEvent>();

  connect(url: string, payload?: unknown): Observable<AGUIEvent> {
    this.disconnect();
    this.url = url;
    this.payload = payload;
    this.manualClose = false;
    this.events$ = new Subject<AGUIEvent>();
    this.openStream();
    return this.events$.asObservable();
  }

  disconnect(): void {
    this.manualClose = true;
    this.reconnectSub?.unsubscribe();
    this.source?.close();
    this.source = undefined;
    this.events$.complete();
  }

  private openStream(): void {
    if (!this.url) return;
    const query = this.payload ? `?payload=${encodeURIComponent(JSON.stringify(this.payload))}` : '';
    this.source = new EventSource(this.url + query);

    this.source.onopen = () => {
      this.reconnectAttempts = 0;
    };

    this.source.onmessage = msg => {
      try {
        const data = JSON.parse(msg.data);
        const event = this.toAgEvent(data);
        if (event) {
          this.events$.next(event);
        }
      } catch {
        // ignore malformed messages
      }
    };

    this.source.onerror = () => {
      this.source?.close();
      if (!this.manualClose) {
        this.scheduleReconnect();
      } else {
        this.events$.complete();
      }
    };
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
