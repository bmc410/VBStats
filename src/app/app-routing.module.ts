import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ConfigureComponent } from "./components/configure/configure.component";
import { MatchComponent } from "./components/match/match.component";
import { SummaryComponent } from './components/summary/summary.component';
const routes: Routes = [
  { path: "configure", component: ConfigureComponent },
  { path: "match", component: MatchComponent },
  { path: "summary", component: SummaryComponent },
  { path: "", component: ConfigureComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
