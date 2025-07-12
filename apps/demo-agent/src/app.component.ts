import { Component, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  AgentUiAdkService,
  AgentUiRendererComponent,
} from "@ag-ui/angular-adk";
import { catchError, EMPTY, Observable } from "rxjs";
import { AGUIEvent } from "@ag-ui/angular-adk";

@Component({
  selector: "demo-root",
  standalone: true,
  imports: [CommonModule, AgentUiRendererComponent],
  template: `
    <div class="demo-container">
      <h1>Demo Agent</h1>
      <div class="status" [class.error]="error">
        {{ error || "Connected to agent" }}
      </div>
      <ag-ui-renderer [eventStream]="events$"></ag-ui-renderer>
    </div>
  `,
  styles: [
    `
      .demo-container {
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
      }
      .status {
        padding: 10px;
        margin: 10px 0;
        background: #e8f5e9;
        border-radius: 4px;
      }
      .status.error {
        background: #ffebee;
      }
    `,
  ],
})
export class AppComponent implements OnDestroy {
  events$: Observable<AGUIEvent>;
  error = "";

  constructor(private agent: AgentUiAdkService) {
    // For demo purposes, we'll simulate some events locally
    // In a real app, you would connect to your backend
    this.events$ = this.agent
      .connect(
        "/api/agent/stream", // Use relative URL, configure proxy in dev server
        { message: "Hello" },
        {
          "X-API-Key": "demo-key", // Add any required headers
        }
      )
      .pipe(
        catchError((err) => {
          this.error = `Connection error: ${err.message}`;
          return EMPTY;
        })
      );
  }

  ngOnDestroy() {
    this.agent.disconnect();
  }
}
