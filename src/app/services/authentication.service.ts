import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, config } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Parse } from 'parse';
import { userToken } from '../models/appModels';
import { NetworkService } from './network.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  token: userToken = null;
  loggedIn: boolean = false;
  offline: boolean = false;

  constructor(private http: HttpClient,
    private networkService: NetworkService) {
    this.networkService.currentStatus.subscribe(result => {
      this.offline = result
    })
    this.getCurrentUser();
    this.currentUser = this.currentUserSubject.asObservable();
    this.initParse()
  }

  isLoggedIn() {
    return this.loggedIn
  }

  getCurrentUser() {
    
    var u = localStorage.getItem('token');
    if (u != 'undefined' && u != null)
    {
    //   const myDate = new Date();
    //   var userToken = JSON.parse(localStorage.getItem('token'))
    //   const tokenDate = new Date(userToken.ttl)
      
    //   if (tokenDate > myDate) {
        this.currentUserSubject = new BehaviorSubject<any>(u);
        this.loggedIn = true
    //   } else {
    //     this.currentUserSubject = new BehaviorSubject<any>(null);  
    //   }
    } 
    else {
      this.currentUserSubject = new BehaviorSubject<any>(null);
      this.loggedIn = false
    }
  }

  initParse() {
    Parse.serverURL = 'https://parseapi.back4app.com'; // This is your Server URL
    Parse.initialize(
      '6jtb78oSAiGeNv2mcJTN0h039TxkJh4HDrWBz7RT', // This is your Application ID
      'bRolkvWkFSewPWnlqQOaaRTpgT16ILr6r7PnU6AY', // This is your Javascript key
      'dHvEstEM97ue9pBcTcW8ofNyqS2ERqT7kg4CnYhX' // This is your Master key (never use it in the frontend)
    );
  }


  public get currentUserValue() {
    return this.currentUserSubject.value;
  }


  login(username, password) {
    if (this.offline == true) {
      var promise = new Promise((resolve, reject) => {
      
      });
      this.loggedIn = true;
      localStorage.setItem('token', JSON.stringify(username));
      this.currentUserSubject.next(username);
      return Promise.resolve(username)
      //return username
    }
    const Users = Parse.Object.extend('Users');
    const query = new Parse.Query(Users);
    query.equalTo("Username", username);
    query.equalTo("Password", password);
    query.equalTo("IsActive", true);
    return query.find().then((result) => {
      var json = JSON.stringify(result);
      var user = JSON.parse(json);
      if (user.length > 0) {
         this.loggedIn = true;
        // this.token = new userToken()
        // this.token.username = user[0].Username;
        // const ttl = new Date();
        // ttl.setHours( ttl.getDate() + 7 );
        // this.token.ttl = ttl
        // var j = JSON.stringify(this.token);
        //localStorage.setItem('token', JSON.stringify(this.token));
        localStorage.setItem('token', JSON.stringify(user[0].Username));
        this.currentUserSubject.next(user[0].Username);
      }
      return user;
    });
  }

  logout() {
    // remove user from local storage and set current user to null
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

}
