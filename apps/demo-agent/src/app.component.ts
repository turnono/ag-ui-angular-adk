import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentUiAdkService, AgentUiRendererComponent } from '@ag-ui/angular-adk';

@Component({
  selector: 'demo-root',
  standalone: true,
  imports: [CommonModule, AgentUiRendererComponent],
  template: `
    <h1>Demo Agent</h1>
    <ag-ui-renderer [eventStream]="events$"></ag-ui-renderer>
  `
})
export class AppComponent {
  events$ = this.agent.connect('http://localhost:8000/run_sse');
  constructor(private agent: AgentUiAdkService) {}
}
