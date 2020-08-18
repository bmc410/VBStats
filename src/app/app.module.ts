import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConfigureComponent } from './components/configure/configure.component';
import { MatchComponent } from './components/match/match.component';
import { NavComponent } from './components/nav/nav.component';

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
import { Parse } from "parse";

// import {MatDatepickerModule} from '@angular/material/datepicker';
// import {MatNativeDateModule} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
// import {MatInputModule} from '@angular/material/input';
// import {MatIconModule} from '@angular/material/icon';
// import {MatButtonModule} from '@angular/material/button';
// import {MatFormField} from '@angular/material/form-field';
// import {MatSidenavModule} from '@angular/material/sidenav';

import {MatSelectModule} from '@angular/material/select';
import { FKpadComponent } from './components/controls/f-kpad/f-kpad.component';
import { RKpadComponent } from './components/controls/r-kpad/r-kpad.component';
import { SummaryComponent } from './components/summary/summary.component';
import {DropdownModule} from 'primeng/dropdown';
import {CheckboxModule} from 'primeng/checkbox';
import {ListboxModule} from 'primeng/listbox'
import {ToastModule} from 'primeng/toast'

import { DexieService } from './services/dexie.service';
import { SKpadComponent } from './components/controls/s-kpad/s-kpad.component';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireModule } from '@angular/fire';
import * as firebase from 'firebase';
import 'firebase/firestore';
import { HeaderComponent } from './components/navigation/header/header.component';
import { SidenavListComponent } from './components/navigation/sidenav-list/sidenav-list.component';
import { LayoutComponent } from './components/layout/layout.component';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import {MatTabsModule} from '@angular/material/tabs';
// import {MatListModule} from '@angular/material/list';
// import {MatMenuModule} from '@angular/material/menu';
// import {MatRadioGroup, MatRadioModule} from '@angular/material/radio';
import { MaterialModule } from './components/material/material.module';
import { MessageService } from 'primeng/api';
import { ScoreboardComponent } from './components/controls/scoreboard/scoreboard.component';
import { TestpanelComponent } from './components/testpanel/testpanel.component';
import { FMobileKpadComponent } from './components/controls/f-mobile-kpad/f-mobile-kpad.component';
import { MobileMatchComponent } from './components/mobile-match/mobile-match.component';
import { MobileScoreboardComponent } from './components/controls/mobile-scoreboard/mobile-scoreboard.component';
import { HybridMatchComponent } from './components/hybrid-match/hybrid-match.component';

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
    SKpadComponent,
    LayoutComponent,
    HeaderComponent,
    SidenavListComponent,
    ScoreboardComponent,
    TestpanelComponent,
    FMobileKpadComponent,
    MobileMatchComponent,
    MobileScoreboardComponent,
    HybridMatchComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
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
    ListboxModule,
    ToastModule,
    //MatDatepickerModule,
    //MatNativeDateModule,
    //MatSelectModule,
    //MatTabsModule,
    //MatListModule,
    //MatMenuModule,
    DropdownModule,
    CheckboxModule,
    //MatIconModule,
    //MatButtonModule,
    //MatInputModule,
    FormsModule,
    //MatSidenavModule,
    //MatToolbarModule,
    //MatRadioModule,
    MaterialModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule.enablePersistence(),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [CarService, MatchService, DexieService,AngularFirestore, MessageService],
  bootstrap: [AppComponent]
})
export class AppModule {}
