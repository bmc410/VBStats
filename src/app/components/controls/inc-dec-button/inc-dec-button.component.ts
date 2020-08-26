import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { faCoffee, faPlus, faMinus, IconDefinition} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-inc-dec-button',
  templateUrl: './inc-dec-button.component.html',
  styleUrls: ['./inc-dec-button.component.css']
})
export class IncDecButtonComponent implements OnInit {
  faPlus = faPlus;
  faMinus=faMinus;
  icon: IconDefinition


  @Input() fontsize: string;
  @Input() sign: string;
  @Input() height: string;
  @Input() width: string;
  @Input() team: string;
  @Input() action: string;
  @Input() stat: string;
  @Input() player: any;

  @Output() signpost = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
    this.setSign()
  }

  updateGame() {
    let signpost = {
      team: this.team,
      action: this.action,
      stat: this.stat,
      player: this.player
    }
    this.signpost.emit(signpost);
  }

  setSign() {
    if (this.sign == "+") {
      this.icon = this.faPlus
    }
    else if (this.sign == "-") {
      this.icon = this.faMinus
    }
  }
}
