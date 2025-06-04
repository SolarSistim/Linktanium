import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { StatusMessageService } from "../ui-components/ui-status/ui-status.service";
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, tap, finalize } from "rxjs";

let activeRequests = 0;
let isDelayingError = false;

export const LoadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const status = inject(StatusMessageService);

  if (activeRequests === 0) {
    status.show("Loading...", "loading");
  }

  activeRequests++;

  return next(req).pipe(
    tap({
      error: (err: HttpErrorResponse) => {
        isDelayingError = true;
        setTimeout(() => {
          status.show("Error loading data.", "error");
          isDelayingError = false;
        }, 5000);
      },
    }),
    finalize(() => {
      activeRequests--;
      if (activeRequests === 0 && !isDelayingError) {
        status.clear();
      } else if (activeRequests === 0 && isDelayingError) {
        setTimeout(() => {
          if (!isDelayingError) {
            status.clear();
          }
        }, 5200);
      }
    })
  );
};
