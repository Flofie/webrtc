import {
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { SignalingService } from '../../signaling.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.scss'],
})
export class VideoComponent implements OnInit, OnDestroy {
  @ViewChild('localVideo') localVideo!: ElementRef;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef;

  private localStream!: MediaStream;
  private peerConnection!: RTCPeerConnection;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  public offers: any[] = [];
  public candidates: any[] = [];
  public tracks: any[] = [];

  public incomingCall: Observable<boolean>;
  public caller: Observable<string | null>;
  public offer: Observable<any>;

  constructor(
    private signalingService: SignalingService,
    private ngZone: NgZone
  ) {
    this.offer = signalingService.offer;
    this.incomingCall = signalingService.incomingCall;
    this.caller = signalingService.caller;
    signalingService.connect();
  }

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(async () => {
      const rpcConfig = await (
        await fetch(
          'https://patient-app-webrtc-config.s3.eu-central-1.amazonaws.com/config.json'
        )
      ).json();
      console.log('rpcConfig', rpcConfig);

      try {
        this.peerConnection = new RTCPeerConnection(rpcConfig);
      } catch (error) {
        console.error(error);
        this.peerConnection = new RTCPeerConnection(rpcConfig);
      }
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.signalingService.sendCandidate(event.candidate);
        }
      };

      this.peerConnection.ontrack = (event) => {
        this.tracks.push(event.streams[0]);
        this.remoteVideo.nativeElement.srcObject = event.streams[0];
      };

      this.signalingService.offer
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(async (offer) => {
          this.offers.push(offer);
          if (offer) {
            await this.peerConnection.setRemoteDescription(offer);
          }
        });

      this.signalingService.iceCandidate
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((candidate) => {
          this.candidates.push(candidate);
          if (candidate) {
            this.peerConnection.addIceCandidate(candidate);
          }
        });

      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      this.localVideo.nativeElement.srcObject = this.localStream;
      this.localVideo.nativeElement.muted = true;

      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      this.signalingService.answeredOffer
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(async (offer) => {
          if (offer) {
            const answer = await this.peerConnection.createAnswer();
            await this.peerConnection.setLocalDescription(answer);
            this.signalingService.sendAnswer(answer);
            this.signalingService.setIncomingCall(false);
          }
        });
    });
  }

  ngOnDestroy(): void {
    this.ngZone.runOutsideAngular(() => {
      this._unsubscribeAll.next(true);
      if (this.peerConnection) {
        this.peerConnection.close();
      }
      if (this.remoteVideo) {
        this.remoteVideo.nativeElement.srcObject = undefined;
      }
      if (this.localVideo) {
        this.localVideo.nativeElement.srcObject = undefined;
      }
      if (this.localStream) {
        this.localStream.getTracks().forEach((track) => track.stop());
      }
    });
  }
}
