import { HttpEvent, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { mergeMap, of, throwError } from 'rxjs';

export function apiInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  const toast = inject(ToastrService);

  if (!req.url.includes('/api/')) {
    return next(req);
  }

  return next(req).pipe(
    mergeMap((event: HttpEvent<any>) => {
      // Spring Boot typically doesn't wrap responses in a code/msg format
      // so we'll skip this transformation for secure-bank APIs
      return of(event);
    })
  );
}