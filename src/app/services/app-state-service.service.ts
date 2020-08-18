import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  private isMobile: boolean;

  constructor() { 
    if (window.innerWidth < 768) {
      this.isMobile = true
    } else {
      this.isMobile = false
    }
  }

  public getIsMobile() : boolean {
    return this.isMobile
  }

}
