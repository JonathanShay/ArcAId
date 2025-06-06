import { ApplicationConfig, SecurityContext } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      (req, next) => {
        console.log('Making request to:', req.url);
        return next(req);
      }
    ])),
    provideAnimations(),
    { provide: SecurityContext, useValue: 0 },
    ...MarkdownModule.forRoot().providers || []
  ]
}; 