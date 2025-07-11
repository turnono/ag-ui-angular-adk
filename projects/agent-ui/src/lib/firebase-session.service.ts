import { Injectable } from '@angular/core';
import { Auth, signInAnonymously } from '@angular/fire/auth';
import { Firestore, docData, doc, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FirebaseSessionService {
  constructor(private auth: Auth, private firestore: Firestore) {}

  async init(): Promise<void> {
    await signInAnonymously(this.auth);
  }

  saveSession(userId: string, sessionId: string, data: unknown): Promise<void> {
    const ref = doc(this.firestore, `sessions/${userId}/history/${sessionId}`);
    return setDoc(ref, data);
  }

  loadSession(userId: string, sessionId: string): Observable<unknown> {
    const ref = doc(this.firestore, `sessions/${userId}/history/${sessionId}`);
    return docData(ref);
  }
}
