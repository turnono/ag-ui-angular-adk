import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { AGUIEvent } from '../ag-ui-event';

@Component({
  selector: 'ag-ui-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ag-ui-renderer">
      <div *ngFor="let e of eventsLog">
        <ng-container [ngSwitch]="e.type">
          <p *ngSwitchCase="'TEXT_MESSAGE_CONTENT'">{{ e.text }}</p>
          <pre *ngSwitchCase="'TOOL_CALL_START'">{{ e.tool }} {{ e.args | json }}</pre>
          <img *ngSwitchCase="'IMAGE_URL_CONTENT'" [src]="e.url" [alt]="e.alt || ''" />
          <button *ngSwitchCase="'BUTTON_RESPONSE_REQUEST'" [value]="e.value">{{ e.label }}</button>
          <pre *ngSwitchCase="'TASK_TREE_UPDATE'">{{ e.nodes | json }}</pre>
          <pre *ngSwitchDefault>{{ e | json }}</pre>
        </ng-container>
      </div>
    </div>
  `,
  styles: [
    `.ag-ui-renderer { font-family: sans-serif; }`
  ]
})
export class AgentUiRendererComponent implements OnInit, OnDestroy {
  @Input() eventStream?: Observable<AGUIEvent>;
  eventsLog: AGUIEvent[] = [];
  private sub?: Subscription;

  ngOnInit() {
    if (this.eventStream) {
      this.sub = this.eventStream.subscribe(e => this.eventsLog.push(e));
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
