import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { userToken } from '../models/appModels';
import { ConnectionService } from 'ng-connection-service';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private currentNetworkSubject: BehaviorSubject<any>;
  //private connected: BehaviorSubject<boolean>;
  public connected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  public currentStatus: Observable<any>;
  isConnected = true;
  //offline: boolean = false;

  constructor(private connectionService: ConnectionService) { 
    this.connectionService.monitor().subscribe(isConnected => {
      this.isConnected = isConnected;
      this.connected.next(isConnected);
    })

    this.currentNetworkSubject = new BehaviorSubject<any>(false);
    this.currentStatus = this.currentNetworkSubject.asObservable();
  }

  getlaststatus(): Boolean {
    var item = localStorage.getItem('lastState')
    if (item != null && item == 'true')
    { return true } 
    else { return false }
   
  }

  HasInternet(): Observable<boolean> {
    return this.connected.asObservable()
  }

  NetworkChange(e) {
    localStorage.setItem('lastState', JSON.stringify(e))
    this.currentNetworkSubject.next(e);
  }
}
