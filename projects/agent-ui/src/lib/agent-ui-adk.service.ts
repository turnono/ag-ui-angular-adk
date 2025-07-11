import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AgEvent } from './ag-ui-event';

@Injectable({ providedIn: 'root' })
export class AgentUiAdkService {
  connect(url: string, payload?: unknown): Observable<AgEvent> {
    return new Observable<AgEvent>(observer => {
      const query = payload ? `?payload=${encodeURIComponent(JSON.stringify(payload))}` : '';
      const source = new EventSource(url + query);

      source.onmessage = msg => {
        try {
          const data = JSON.parse(msg.data);
          const event = this.toAgEvent(data);
          observer.next(event);
        } catch (err) {
          observer.error(err);
        }
      };

      source.onerror = err => {
        observer.error(err);
        source.close();
      };

      return () => source.close();
    });
  }

  private toAgEvent(adk: any): AgEvent {
    if (adk.message) {
      return { type: 'text', content: adk.message };
    }
    if (adk.image) {
      return { type: 'image', url: adk.image };
    }
    return { type: 'tool', tool: adk.tool, args: adk.args };
  }
}
