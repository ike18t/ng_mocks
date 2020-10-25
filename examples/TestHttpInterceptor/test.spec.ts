import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injectable, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder } from 'ng-mocks';
import { Observable } from 'rxjs';

// An interceptor we want to test.
@Injectable()
class TargetInterceptor implements HttpInterceptor {
  protected value = 'HttpInterceptor';

  public intercept(request: HttpRequest<void>, next: HttpHandler): Observable<HttpEvent<void>> {
    return next.handle(
      request.clone({
        setHeaders: {
          'My-Custom': this.value,
        },
      })
    );
  }
}

// A module with its definition.
@NgModule({
  imports: [HttpClientModule],
  providers: [
    TargetInterceptor,
    {
      multi: true,
      provide: HTTP_INTERCEPTORS,
      useClass: TargetInterceptor,
    },
  ],
})
class TargetModule {}

describe('TestHttpInterceptor', () => {
  // Because we want to test the interceptor, we pass it as the first
  // parameter of MockBuilder. To correctly satisfy its dependencies
  // we need to pass its module as the second parameter. Also we
  // should mocking HTTP_INTERCEPTORS and replace HttpClientModule
  // with HttpClientTestingModule.
  beforeEach(() =>
    MockBuilder(TargetInterceptor, TargetModule)
      .keep(HTTP_INTERCEPTORS)
      .replace(HttpClientModule, HttpClientTestingModule)
  );

  it('triggers interceptor', () => {
    const client: HttpClient = TestBed.get(HttpClient);
    const httpMock: HttpTestingController = TestBed.get(HttpTestingController);

    // Let's do a simply request.
    client.get('/target').subscribe();

    // Now we can assert that a header has been added to the request.
    const req = httpMock.expectOne('/target');
    expect(req.request.headers.get('My-Custom')).toEqual('HttpInterceptor');
    req.flush('');
    httpMock.verify();
  });
});