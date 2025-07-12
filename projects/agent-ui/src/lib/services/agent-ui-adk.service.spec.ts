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
});
