import { Component, ElementRef, ViewChild } from '@angular/core';

declare var io: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  @ViewChild('localVideo') localVideo!: ElementRef;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef;

  private localStream!: MediaStream;
  private peerConnection!: RTCPeerConnection;
  private socket!: any;
  public connected = false;
  public connecting = false;
  public busy = false;

  constructor() {}

  async ngOnInit(): Promise<void> {
    this.busy = true;
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

    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    this.localVideo.nativeElement.srcObject = this.localStream;
    this.localVideo.nativeElement.muted = true;

    this.peerConnection.ontrack = (event) => {
      this.remoteVideo.nativeElement.srcObject = event.streams[0];
    };

    this.localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, this.localStream);
    });

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit('ice-candidate', event.candidate);
      }
    };

    this.socket = io('wss://signaling.k8s.api.halloalberta.de', {
      auth: {
        patientId: 'b7333cf7-c03c-4461-9a70-b334fc9a4ba7',
        token: '',
        tenantId: '70000',
      },
      upgrade: false,
      transports: ['websocket'],
    });

    this.socket.on('answer', (answer: any) => {
      this.peerConnection.setRemoteDescription(answer);
      this.connected = true;
      this.connecting = false;
    });

    this.socket.on('ice-candidate', (candidate: any) => {
      this.peerConnection.addIceCandidate(candidate);
    });

    this.busy = false;
  }

  ngOnDestroy(): void {
    if (this.peerConnection) {
      this.peerConnection.close();
    }
    if (this.socket) {
      this.socket.close();
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
    this.connected = false;
  }

  async call(): Promise<void> {
    this.connecting = true;
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    this.socket.emit('offer', {
      offer,
      // tslint:disable-next-line:max-line-length
      caller: `Test`,
    });
  }

  close(): void {
    this.ngOnDestroy();
  }
}
