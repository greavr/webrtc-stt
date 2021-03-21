import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ChatComponent} from "./chat/chat.component";
import {AppComponent} from "./app.component";
import {MeetingComponent} from "./meeting/meeting.component";

const routes: Routes = [
  { path: '', component: AppComponent},
  { path: 'chat', component: ChatComponent},
  { path: 'meeting', component: MeetingComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {


}
