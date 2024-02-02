import { NgModule } from '@angular/core';

import { RouterModule } from '@angular/router';
import { VideoComponent } from './video.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: VideoComponent },
    ]),
  ],
  declarations: [VideoComponent],
})
export class VideoModule {}
