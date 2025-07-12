import { AgentUiAdkService } from './agent-ui-adk.service';

describe('AgentUiAdkService', () => {
  it('should create', () => {
    const service = new AgentUiAdkService();
    expect(service).toBeTruthy();
  });

  it('should expose disconnect', () => {
    const service = new AgentUiAdkService();
    expect(typeof service.disconnect).toBe('function');
  });

  it('connect should return an observable', () => {
    const service = new AgentUiAdkService();
    const stream = service.connect('/agents/a/run_sse', { foo: 'bar' }, {
      'X-Agent-Run-ID': 'test'
    });
    expect(typeof (stream as any).subscribe).toBe('function');
    service.disconnect();
  });
});
