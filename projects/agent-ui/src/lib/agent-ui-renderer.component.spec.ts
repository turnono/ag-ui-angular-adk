import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AgentUiRendererComponent } from './agent-ui-renderer.component';

describe('AgentUiRendererComponent', () => {
  let component: AgentUiRendererComponent;
  let fixture: ComponentFixture<AgentUiRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentUiRendererComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgentUiRendererComponent);
    component = fixture.componentInstance;
    component.events = of({ type: 'text', content: 'hi' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
