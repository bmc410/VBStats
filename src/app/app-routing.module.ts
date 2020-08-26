import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ConfigureComponent } from "./components/configure/configure.component";
import { MatchComponent } from "./components/match/match.component";
import { SummaryComponent } from './components/summary/summary.component';
import { ScoreboardComponent } from './components/controls/scoreboard/scoreboard.component';
import { TestpanelComponent } from './components/testpanel/testpanel.component';
import { MobileMatchComponent } from './components/mobile-match/mobile-match.component';
import { MobileScoreboardComponent } from './components/controls/mobile-scoreboard/mobile-scoreboard.component';
import { HybridMatchComponent } from './components/hybrid-match/hybrid-match.component';
import { AuthGuard } from './auth-guard';
import { LoginComponent } from './components/login/login.component';
import { ResponsiveMatchComponent } from './components/responsive-match/responsive-match.component';

const routes: Routes = [
  { path: "configure", component: ConfigureComponent, canActivate: [AuthGuard] },
  { path: "match", component: ResponsiveMatchComponent, canActivate: [AuthGuard] },
  { path: "summary", component: SummaryComponent },
  { path: "scoreboard", component: ScoreboardComponent},
  { path: "test", component: TestpanelComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: 'configure', pathMatch:'full' },
  { path: "", redirectTo:'configure', pathMatch:'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
