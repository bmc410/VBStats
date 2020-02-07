import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConfigureComponent } from './components/configure/configure.component';
import { MatchComponent } from './components/match/match.component';
import { NavComponent } from './components/nav/nav.component';
import { DndModule } from '../../node_modules/ngx-drag-drop';

import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { CarService } from './services/carservice';
import { HttpClientModule } from '@angular/common/http';
import { MatchService } from './services/matchservice';
import { DialogModule, Dialog } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TabMenuModule } from 'primeng/tabmenu';
import { CreateMatchComponent } from './components/create-match/create-match.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DragdropComponent } from './components/dragdrop/dragdrop.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import {ToolbarModule} from 'primeng/toolbar';
import { RouterModule, Routes } from '@angular/router';
import {
  MatDatepickerModule,
  MatNativeDateModule,
  MatFormFieldModule,
  MatInputModule
} from '@angular/material';
import {MatSelectModule} from '@angular/material/select';
import { FKpadComponent } from './components/controls/f-kpad/f-kpad.component';
import { RKpadComponent } from './components/controls/r-kpad/r-kpad.component';
import { SummaryComponent } from './components/summary/summary.component';
import {DropdownModule} from 'primeng/dropdown';
import {CheckboxModule} from 'primeng/checkbox';
import { DexieService } from './services/dexie.service';
import { SKpadComponent } from './components/controls/s-kpad/s-kpad.component';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireModule } from '@angular/fire';
import * as firebase from 'firebase';
import 'firebase/firestore';

@NgModule({
  declarations: [
    AppComponent,
    ConfigureComponent,
    MatchComponent,
    NavComponent,
    CreateMatchComponent,
    DragdropComponent,
    FKpadComponent,
    RKpadComponent,
    SummaryComponent,
    SKpadComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DndModule,
    DragDropModule,
    PanelModule,
    TableModule,
    TabViewModule,
    HttpClientModule,
    DialogModule,
    BrowserAnimationsModule,
    CalendarModule,
    FormsModule,
    ReactiveFormsModule,
    TabMenuModule,
    ToolbarModule,
    PanelModule,
    RouterModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    DropdownModule,
    CheckboxModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [CarService, MatchService, DexieService,AngularFirestore],
  bootstrap: [AppComponent]
})
export class AppModule {}
