import { FirebaseSessionService } from './firebase-session.service';

describe('FirebaseSessionService', () => {
  it('should create', () => {
    const service = new FirebaseSessionService({} as any, {} as any);
    expect(service).toBeTruthy();
  });
});
