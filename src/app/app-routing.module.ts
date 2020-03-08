import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ConfigureComponent } from "./components/configure/configure.component";
import { MatchComponent } from "./components/match/match.component";
import { SummaryComponent } from './components/summary/summary.component';
import { ScoreboardComponent } from './components/controls/scoreboard/scoreboard.component';
import { TestpanelComponent } from './components/testpanel/testpanel.component';
const routes: Routes = [
  { path: "configure", component: ConfigureComponent },
  { path: "match", component: MatchComponent },
  { path: "summary", component: SummaryComponent },
  { path: "scoreboard", component: ScoreboardComponent},
  { path: "test", component: TestpanelComponent },
  { path: "", component: ConfigureComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
