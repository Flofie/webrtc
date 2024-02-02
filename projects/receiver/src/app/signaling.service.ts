import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Socket, io } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SignalingService {
  private socket$ = new BehaviorSubject<Socket | null>(null);
  private offer$ = new BehaviorSubject(null);
  private caller$ = new BehaviorSubject<string | null>(null);
  private incomingCall$ = new BehaviorSubject(false);
  private answeredOffer$ = new BehaviorSubject(null);
  private iceCandidate$ = new BehaviorSubject(null);

  constructor() {}

  public get offer() {
    return this.offer$.asObservable();
  }

  public get caller() {
    return this.caller$.asObservable();
  }

  public get incomingCall() {
    return this.incomingCall$.asObservable();
  }

  public get answeredOffer() {
    return this.answeredOffer$.asObservable();
  }

  public get iceCandidate() {
    return this.iceCandidate$.asObservable();
  }

  async connect(): Promise<void> {
    this.socket$.next(
      io('wss://signaling.k8s.api.halloalberta.de', {
        auth: {
          patientId: 'b7333cf7-c03c-4461-9a70-b334fc9a4ba7',
          token: '',
          tenantId: '70000',
          isPatientApp: true,
        },
        upgrade: false,
        transports: ['websocket'],
      })
    );

    this.socket$.value!.on('offer', async (offer) => {
      this.offer$.next(offer.offer);
      this.caller$.next(offer.caller);
      this.incomingCall$.next(true);
    });

    this.socket$.value!.on('ice-candidate', async (candidate) => {
      this.iceCandidate$.next(candidate);
    });
  }

  public sendAnswer(answer: any) {
    this.socket$.value!.emit('answer', answer);
  }

  public sendCandidate(candidate: any) {
    this.socket$.value!.emit('ice-candidate', candidate);
  }

  public setIncomingCall(incomingCall: boolean) {
    this.incomingCall$.next(incomingCall);
  }

  public setAnsweredCall(offer: any) {
    this.answeredOffer$.next(offer);
  }
}
