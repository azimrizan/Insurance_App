import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { PaymentService, Payment, RecordPaymentRequest } from './payment';
import { environment } from '../../environments/environment';

describe('PaymentService', () => {
  let service: PaymentService;
  let httpMock: HttpTestingController;

  const mockPayment: Payment = {
    _id: '1',
    userId: 'user1',
    userPolicyId: 'policy1',
    amount: 1200,
    method: 'CREDIT_CARD',
    reference: 'TXN123456',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  };

  const mockPayments: Payment[] = [
    mockPayment,
    {
      _id: '2',
      userId: 'user1',
      userPolicyId: 'policy2',
      amount: 800,
      method: 'BANK_TRANSFER',
      reference: 'TXN789012',
      createdAt: '2024-01-02T10:00:00Z',
      updatedAt: '2024-01-02T10:00:00Z'
    }
  ];

  const mockRecordPaymentRequest: RecordPaymentRequest = {
    policyId: 'policy1',
    amount: 1200,
    method: 'CREDIT_CARD',
    reference: 'TXN123456'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PaymentService]
    });
    service = TestBed.inject(PaymentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('recordPayment', () => {
    it('should record a payment', () => {
      service.recordPayment(mockRecordPaymentRequest).subscribe(payment => {
        expect(payment).toEqual(mockPayment);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/payments`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockRecordPaymentRequest);
      req.flush(mockPayment);
    });

    it('should record a payment without policyId', () => {
      const paymentRequestWithoutPolicy = {
        amount: 500,
        method: 'CASH',
        reference: 'CASH001'
      };

      service.recordPayment(paymentRequestWithoutPolicy).subscribe(payment => {
        expect(payment).toEqual(mockPayment);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/payments`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(paymentRequestWithoutPolicy);
      req.flush(mockPayment);
    });

    it('should handle recordPayment error', () => {
      service.recordPayment(mockRecordPaymentRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/payments`);
      req.flush({ error: 'Invalid payment data' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle recordPayment with different payment methods', () => {
      const methods = ['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'CASH', 'CHECK'];
      
      methods.forEach(method => {
        const request = { ...mockRecordPaymentRequest, method };
        service.recordPayment(request).subscribe(payment => {
          expect(payment).toEqual(mockPayment);
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/payments`);
        expect(req.request.body).toEqual(request);
        req.flush(mockPayment);
      });
    });
  });

  describe('getUserPayments', () => {
    it('should get user payments', () => {
      service.getUserPayments().subscribe(payments => {
        expect(payments).toEqual(mockPayments);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/payments/user`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPayments);
    });

    it('should handle getUserPayments error', () => {
      service.getUserPayments().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/payments/user`);
      req.flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should return empty array when no payments exist', () => {
      service.getUserPayments().subscribe(payments => {
        expect(payments).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/payments/user`);
      req.flush([]);
    });

    it('should handle getUserPayments with different HTTP status codes', () => {
      const statusCodes = [200, 401, 403, 404, 500];
      
      statusCodes.forEach(status => {
        service.getUserPayments().subscribe({
          next: (payments) => {
            if (status === 200) {
              expect(payments).toEqual(mockPayments);
            } else {
              fail('Should have failed for non-200 status');
            }
          },
          error: (error) => {
            if (status !== 200) {
              expect(error.status).toBe(status);
            } else {
              fail('Should not have failed for 200 status');
            }
          }
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/payments/user`);
        if (status === 200) {
          req.flush(mockPayments);
        } else {
          req.flush({ error: 'Error' }, { status, statusText: 'Error' });
        }
      });
    });
  });
});
