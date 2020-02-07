import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { StatNib } from 'src/app/models/appModels';

@Component({
  selector: 'app-s-kpad',
  templateUrl: './s-kpad.component.html',
  styleUrls: ['./s-kpad.component.css']
})
export class SKpadComponent implements OnInit {

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
