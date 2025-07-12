import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AGUIEvent } from '../ag-ui-event';

@Injectable({ providedIn: 'root' })
export class AgentUiAdkService {
  connect(url: string, payload?: unknown): Observable<AGUIEvent> {
    return new Observable<AGUIEvent>(observer => {
      const query = payload ? `?payload=${encodeURIComponent(JSON.stringify(payload))}` : '';
      const source = new EventSource(url + query);

      source.onmessage = msg => {
        try {
          const data = JSON.parse(msg.data);
          const event = this.toAgEvent(data);
          if (event) {
            observer.next(event);
          }
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
