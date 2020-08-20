import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { userToken } from '../models/appModels';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private currentNetworkSubject: BehaviorSubject<any>;
  public currentStatus: Observable<any>;
  //offline: boolean = false;

  constructor() { 
    this.currentNetworkSubject = new BehaviorSubject<any>(false);
    this.currentStatus = this.currentNetworkSubject.asObservable();
  }

  getlaststatus(): Boolean {
    var item = localStorage.getItem('lastState')
    if (item != null && item == 'true')
    { return true } 
    else { return false }
   
  }

  NetworkChange(e) {
    localStorage.setItem('lastState', JSON.stringify(e))
    this.currentNetworkSubject.next(e);
  }
}
