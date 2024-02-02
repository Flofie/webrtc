import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { IncomingCallComponent } from './components/incoming-call.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadChildren: () =>
      import('./pages/home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'video',
    pathMatch: 'full',
    loadChildren: () =>
      import('./pages/video/video.module').then((m) => m.VideoModule),
  },
];
@NgModule({
  declarations: [AppComponent, IncomingCallComponent],
  imports: [BrowserModule, RouterModule.forRoot(routes)],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
