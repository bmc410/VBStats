import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { StatNib } from 'src/app/models/appModels';

@Component({
  selector: 'app-f-mobile-kpad',
  templateUrl: './f-mobile-kpad.component.html',
  styleUrls: ['./f-mobile-kpad.component.css']
})
export class FMobileKpadComponent implements OnInit {

  @Input() posNum: string;
  @Input() playerName: string;
  @Output() statPost = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  DoStat(stat:string) {
    let s = new StatNib(parseInt(this.posNum),stat);
    this.statPost.emit(s);
  }

}
