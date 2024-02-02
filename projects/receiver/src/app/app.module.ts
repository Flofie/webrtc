import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { RouterModule, Routes } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
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
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
