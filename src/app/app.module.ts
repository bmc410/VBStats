import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ConfigureComponent } from "./components/configure/configure.component";
import { MatchComponent } from "./components/match/match.component";
import { NavComponent } from "./components/nav/nav.component";
import { DndModule } from "../../node_modules/ngx-drag-drop";

import { PanelModule } from "primeng/panel";
import { TableModule } from "primeng/table";
import { TabViewModule } from "primeng/tabview";
import { CarService } from "./services/carservice";
import { HttpClientModule } from "@angular/common/http";
import { MatchService } from "./services/matchservice";
import { DialogModule, Dialog } from "primeng/dialog";
import { CalendarModule } from "primeng/calendar";
import { FormsModule } from "@angular/forms";
import { TabMenuModule } from "primeng/tabmenu";
import { MenuItem } from "primeng/api";
import { CreateMatchComponent } from "./components/create-match/create-match.component";
import { DragDropModule } from "@angular/cdk/drag-drop";

@NgModule({
  declarations: [
    AppComponent,
    ConfigureComponent,
    MatchComponent,
    NavComponent,
    CreateMatchComponent
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
    TabMenuModule
  ],
  providers: [CarService, MatchService],
  bootstrap: [AppComponent]
})
export class AppModule {}
