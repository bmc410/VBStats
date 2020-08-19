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

  NetworkChange(e) {
    this.currentNetworkSubject.next(e);

  }

}
