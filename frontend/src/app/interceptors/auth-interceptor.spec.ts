import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest, HttpEvent, HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs';

import { authInterceptor } from './auth-interceptor';
import { AuthService } from '../services/auth';

describe('authInterceptor', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockNext: jasmine.Spy<(req: HttpRequest<any>) => any>;
  let interceptor: HttpInterceptorFn;

  const mockRequest = new HttpRequest('GET', '/api/test');
  const mockResponse = { status: 200, body: 'test response' };

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken']);
    const nextSpy = jasmine.createSpy('next').and.returnValue(of(mockResponse as HttpEvent<any>));

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockNext = nextSpy;
    
    interceptor = (req, next) => 
      TestBed.runInInjectionContext(() => authInterceptor(req, next));
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should add Authorization header when token exists', () => {
    const token = 'test-token-123';
    mockAuthService.getToken.and.returnValue(token);

    interceptor(mockRequest, mockNext);

    expect(mockAuthService.getToken).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
    
    const interceptedRequest = mockNext.calls.mostRecent().args[0] as HttpRequest<any>;
    expect(interceptedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
  });

  it('should not add Authorization header when token is null', () => {
    mockAuthService.getToken.and.returnValue(null);

    interceptor(mockRequest, mockNext);

    expect(mockAuthService.getToken).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
    
    const interceptedRequest = mockNext.calls.mostRecent().args[0] as HttpRequest<any>;
    expect(interceptedRequest.headers.get('Authorization')).toBeNull();
  });

  it('should not add Authorization header when token is empty string', () => {
    mockAuthService.getToken.and.returnValue('');

    interceptor(mockRequest, mockNext);

    expect(mockAuthService.getToken).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
    
    const interceptedRequest = mockNext.calls.mostRecent().args[0] as HttpRequest<any>;
    expect(interceptedRequest.headers.get('Authorization')).toBeNull();
  });

  it('should preserve existing headers when adding Authorization', () => {
    const token = 'test-token-456';
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Custom-Header': 'custom-value'
    });
    const requestWithHeaders = new HttpRequest('POST', '/api/test', {}, {
      headers: headers
    });
    
    mockAuthService.getToken.and.returnValue(token);

    interceptor(requestWithHeaders, mockNext);

    const interceptedRequest = mockNext.calls.mostRecent().args[0] as HttpRequest<any>;
    expect(interceptedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
    expect(interceptedRequest.headers.get('Content-Type')).toBe('application/json');
    expect(interceptedRequest.headers.get('Custom-Header')).toBe('custom-value');
  });

  it('should clone the request when adding Authorization header', () => {
    const token = 'test-token-789';
    mockAuthService.getToken.and.returnValue(token);

    interceptor(mockRequest, mockNext);

    const interceptedRequest = mockNext.calls.mostRecent().args[0] as HttpRequest<any>;
    expect(interceptedRequest).not.toBe(mockRequest); // Should be a clone
    expect(interceptedRequest.url).toBe(mockRequest.url);
    expect(interceptedRequest.method).toBe(mockRequest.method);
  });

  it('should handle different HTTP methods correctly', () => {
    const token = 'test-token-abc';
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;
    
    mockAuthService.getToken.and.returnValue(token);

    methods.forEach(method => {
      let request: HttpRequest<any>;
      if (method === 'GET') {
        request = new HttpRequest('GET', '/api/test');
      } else if (method === 'POST') {
        request = new HttpRequest('POST', '/api/test', {});
      } else if (method === 'PUT') {
        request = new HttpRequest('PUT', '/api/test', {});
      } else if (method === 'DELETE') {
        request = new HttpRequest('DELETE', '/api/test');
      } else if (method === 'PATCH') {
        request = new HttpRequest('PATCH', '/api/test', {});
      } else {
        request = new HttpRequest(method, '/api/test');
      }
      
      interceptor(request, mockNext);
      
      const interceptedRequest = mockNext.calls.mostRecent().args[0] as HttpRequest<any>;
      expect(interceptedRequest.method).toBe(method);
      expect(interceptedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
    });
  });

  it('should handle requests with body correctly', () => {
    const token = 'test-token-def';
    const requestBody = { name: 'test', value: 123 };
    const requestWithBody = new HttpRequest('POST', '/api/test', requestBody);
    
    mockAuthService.getToken.and.returnValue(token);

    interceptor(requestWithBody, mockNext);

    const interceptedRequest = mockNext.calls.mostRecent().args[0] as HttpRequest<any>;
    expect(interceptedRequest.body).toEqual(requestBody);
    expect(interceptedRequest.headers.get('Authorization')).toBe(`Bearer ${token}`);
  });
});
