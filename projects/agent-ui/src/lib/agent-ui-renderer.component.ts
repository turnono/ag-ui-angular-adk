import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { AgEvent } from './ag-ui-event';

@Component({
  selector: 'ag-ui-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ag-ui-renderer">
      <div *ngFor="let e of eventsLog">
        <ng-container [ngSwitch]="e.type">
          <p *ngSwitchCase="'text'">{{ e.content }}</p>
          <button *ngSwitchCase="'button'">{{ e.label }}</button>
          <img *ngSwitchCase="'image'" [src]="e.url" [alt]="e.alt || ''" />
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
  @Input() events?: Observable<AgEvent>;
  eventsLog: AgEvent[] = [];
  private sub?: Subscription;

  ngOnInit() {
    if (this.events) {
      this.sub = this.events.subscribe(e => this.eventsLog.push(e));
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
