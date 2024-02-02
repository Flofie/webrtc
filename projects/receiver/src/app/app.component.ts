import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SignalingService } from './signaling.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  public incomingCall: Observable<boolean>;
  public caller: Observable<string | null>;
  public offer: Observable<any>;

  constructor(
    private signalingService: SignalingService,
    private router: Router
  ) {
    this.offer = signalingService.offer;
    this.incomingCall = signalingService.incomingCall;
    this.caller = signalingService.caller;
  }
  ngOnInit(): void {
    void this.signalingService.connect();
  }

  async acceptIncomingCall(offer: any) {
    await this.signalingService.setAnsweredCall(offer);
    this.router.navigate(['/video']);
  }
}
