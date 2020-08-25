import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { StatNib } from 'src/app/models/appModels';

@Component({
  selector: 'app-r-mobile-kpad',
  templateUrl: './r-mobile-kpad.component.html',
  styleUrls: ['./r-mobile-kpad.component.css']
})
export class RMobileKpadComponent implements OnInit {

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
