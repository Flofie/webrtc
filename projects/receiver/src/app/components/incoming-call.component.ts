import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';

@Component({
  selector: 'itl-incoming-call',
  template: `
    <div class="incomming-call-box">
      <div class="message">
        <div class="text">Eingehender Anrufe von {{ this.caller }}</div>
        <button
          class="action-button button-accept"
          (click)="this.handleAccept()"
        >
          Annehmen
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./incoming-call.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncomingCallComponent implements OnInit {
  @Output() public accept = new EventEmitter<void>();
  @Input() public offer: any;
  @Input() public caller: any;

  constructor() {}

  ngOnInit(): void {}

  public handleAccept() {
    this.accept.emit(this.offer);
  }
}
