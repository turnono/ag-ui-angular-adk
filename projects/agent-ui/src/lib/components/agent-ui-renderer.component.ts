import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Observable, Subscription } from "rxjs";
import { AGUIEvent } from "../ag-ui-event";

@Component({
  selector: "ag-ui-renderer",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ag-ui-renderer">
      <div *ngFor="let e of eventsLog">
        <ng-container [ngSwitch]="e.type">
          <p *ngSwitchCase="'TEXT_MESSAGE_CONTENT'">
            {{ isTextMessage(e) ? e.text : "" }}
          </p>
          <pre *ngSwitchCase="'TOOL_CALL_START'">{{
            isToolCall(e) ? e.tool + " " + (e.args | json) : ""
          }}</pre>
          <img
            *ngSwitchCase="'IMAGE_URL_CONTENT'"
            [src]="isImageUrl(e) ? e.url : ''"
            [alt]="isImageUrl(e) ? e.alt || '' : ''"
          />
          <button
            *ngSwitchCase="'BUTTON_RESPONSE_REQUEST'"
            [value]="isButtonResponse(e) ? e.value : ''"
          >
            {{ isButtonResponse(e) ? e.label : "" }}
          </button>
          <pre *ngSwitchCase="'TASK_TREE_UPDATE'">{{
            isTaskTree(e) ? (e.nodes | json) : ""
          }}</pre>
          <pre *ngSwitchDefault>{{ e | json }}</pre>
        </ng-container>
      </div>
    </div>
  `,
  styles: [
    `
      .ag-ui-renderer {
        font-family: sans-serif;
      }
    `,
  ],
})
export class AgentUiRendererComponent implements OnInit, OnDestroy {
  @Input() eventStream?: Observable<AGUIEvent>;
  eventsLog: AGUIEvent[] = [];
  private sub?: Subscription;

  isTextMessage(
    e: AGUIEvent
  ): e is { type: "TEXT_MESSAGE_CONTENT"; text: string } {
    return e.type === "TEXT_MESSAGE_CONTENT";
  }

  isToolCall(
    e: AGUIEvent
  ): e is { type: "TOOL_CALL_START"; tool: string; args: unknown } {
    return e.type === "TOOL_CALL_START";
  }

  isImageUrl(
    e: AGUIEvent
  ): e is { type: "IMAGE_URL_CONTENT"; url: string; alt?: string } {
    return e.type === "IMAGE_URL_CONTENT";
  }

  isButtonResponse(
    e: AGUIEvent
  ): e is { type: "BUTTON_RESPONSE_REQUEST"; label: string; value: string } {
    return e.type === "BUTTON_RESPONSE_REQUEST";
  }

  isTaskTree(e: AGUIEvent): e is { type: "TASK_TREE_UPDATE"; nodes: unknown } {
    return e.type === "TASK_TREE_UPDATE";
  }

  ngOnInit() {
    if (this.eventStream) {
      this.sub = this.eventStream.subscribe((e) => this.eventsLog.push(e));
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
