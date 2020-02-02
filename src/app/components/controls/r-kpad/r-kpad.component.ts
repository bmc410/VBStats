import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { StatNib } from 'src/app/models/appModels';

@Component({
  selector: 'app-r-kpad',
  templateUrl: './r-kpad.component.html',
  styleUrls: ['./r-kpad.component.css']
})
export class RKpadComponent implements OnInit {

  @Input() posNum: string;
  @Output() statPost = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  DoStat(stat:string) {
    let s = new StatNib(parseInt(this.posNum),stat);
    this.statPost.emit(s);
  }

}
