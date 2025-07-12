import { Injectable } from '@angular/core';
import { Auth, signInAnonymously } from '@angular/fire/auth';
import { Firestore, docData, doc, setDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FirebaseSessionService {
  private initPromise?: Promise<void>;
  session$ = new BehaviorSubject<unknown>(null);

  constructor(private auth: Auth, private firestore: Firestore) {
    this.ensureInit();
  }

  private async ensureInit(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = signInAnonymously(this.auth).then(() => {});
    }
    return this.initPromise;
  }

  getCurrentUserId(): string | undefined {
    return this.auth.currentUser?.uid;
  }

  async saveSession(sessionId: string, data: unknown): Promise<void> {
    await this.ensureInit();
    const userId = this.getCurrentUserId();
    if (!userId) return;
    const ref = doc(this.firestore, `sessions/${userId}/history/${sessionId}`);
    await setDoc(ref, data);
  }

  async loadSession(sessionId: string): Promise<void> {
    await this.ensureInit();
    const userId = this.getCurrentUserId();
    if (!userId) return;
    const ref = doc(this.firestore, `sessions/${userId}/history/${sessionId}`);
    docData(ref).subscribe(data => this.session$.next(data));
  }
}
