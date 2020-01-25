import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ConfigureComponent } from "./components/configure/configure.component";
import { MatchComponent } from "./components/match/match.component";
const routes: Routes = [
  { path: "configure", component: ConfigureComponent },
  { path: "match", component: MatchComponent },
  { path: "dragdrop", component: MatchComponent },
  { path: "", component: ConfigureComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
