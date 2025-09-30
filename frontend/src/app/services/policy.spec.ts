import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { PolicyService, PolicyProduct, UserPolicy, PurchasePolicyRequest } from './policy';
import { environment } from '../../environments/environment';

describe('PolicyService', () => {
  let service: PolicyService;
  let httpMock: HttpTestingController;

  const mockPolicyProduct: PolicyProduct = {
    _id: '1',
    code: 'AUTO001',
    title: 'Auto Insurance',
    description: 'Comprehensive auto insurance coverage',
    premium: 1200,
    termMonths: 12,
    minSumInsured: 50000,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  };

  const mockPolicyProducts: PolicyProduct[] = [
    mockPolicyProduct,
    {
      _id: '2',
      code: 'HOME001',
      title: 'Home Insurance',
      description: 'Homeowners insurance coverage',
      premium: 800,
      termMonths: 12,
      minSumInsured: 200000,
      createdAt: '2024-01-01T10:00:00Z',
      updatedAt: '2024-01-01T10:00:00Z'
    }
  ];

  const mockUserPolicy: UserPolicy = {
    _id: '1',
    userId: 'user1',
    policyProductId: mockPolicyProduct,
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    premiumPaid: 1200,
    status: 'ACTIVE',
    assignedAgentId: 'agent1',
    nominee: {
      name: 'Jane Doe',
      relation: 'Spouse'
    },
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z'
  };

  const mockUserPolicies: UserPolicy[] = [
    mockUserPolicy,
    {
      _id: '2',
      userId: 'user1',
      policyProductId: mockPolicyProducts[1],
      startDate: '2023-01-01T00:00:00Z',
      endDate: '2023-12-31T23:59:59Z',
      premiumPaid: 800,
      status: 'CANCELLED',
      assignedAgentId: 'agent2',
      nominee: undefined,
      createdAt: '2023-01-01T10:00:00Z',
      updatedAt: '2023-06-01T10:00:00Z'
    }
  ];

  const mockPurchasePolicyRequest: PurchasePolicyRequest = {
    startDate: '2024-01-01T00:00:00Z',
    termMonths: 12,
    nominee: {
      name: 'Jane Doe',
      relation: 'Spouse'
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PolicyService]
    });
    service = TestBed.inject(PolicyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPolicyProducts', () => {
    it('should get all policy products', () => {
      service.getPolicyProducts().subscribe(products => {
        expect(products).toEqual(mockPolicyProducts);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/policies`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPolicyProducts);
    });

    it('should handle getPolicyProducts error', () => {
      service.getPolicyProducts().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/policies`);
      req.flush({ error: 'Internal server error' }, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('getPolicyProductById', () => {
    it('should get policy product by ID', () => {
      const productId = '1';
      service.getPolicyProductById(productId).subscribe(product => {
        expect(product).toEqual(mockPolicyProduct);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/policies/${productId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPolicyProduct);
    });

    it('should handle getPolicyProductById error', () => {
      const productId = '999';
      service.getPolicyProductById(productId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/policies/${productId}`);
      req.flush({ error: 'Policy product not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createPolicyProduct', () => {
    it('should create new policy product', () => {
      const newProductData = {
        code: 'LIFE001',
        title: 'Life Insurance',
        description: 'Term life insurance',
        premium: 500,
        termMonths: 24,
        minSumInsured: 100000
      };
      const newProduct = { ...newProductData, _id: '3', createdAt: '2024-01-01T10:00:00Z', updatedAt: '2024-01-01T10:00:00Z' };

      service.createPolicyProduct(newProductData).subscribe(product => {
        expect(product).toEqual(newProduct);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/policies`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newProductData);
      req.flush(newProduct);
    });

    it('should handle createPolicyProduct error', () => {
      const newProductData = { code: 'AUTO001', title: 'Auto Insurance' };

      service.createPolicyProduct(newProductData).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/policies`);
      req.flush({ error: 'Policy code already exists' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('deletePolicyProduct', () => {
    it('should delete policy product', () => {
      const productId = '1';
      const response = { message: 'Policy product deleted successfully' };

      service.deletePolicyProduct(productId).subscribe(result => {
        expect(result).toEqual(response);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/policies/${productId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(response);
    });

    it('should handle deletePolicyProduct error', () => {
      const productId = '999';

      service.deletePolicyProduct(productId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/policies/${productId}`);
      req.flush({ error: 'Policy product not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('purchasePolicy', () => {
    it('should purchase a policy', () => {
      const policyId = '1';
      service.purchasePolicy(policyId, mockPurchasePolicyRequest).subscribe(userPolicy => {
        expect(userPolicy).toEqual(mockUserPolicy);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/policies/${policyId}/purchase`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockPurchasePolicyRequest);
      req.flush(mockUserPolicy);
    });

    it('should handle purchasePolicy error', () => {
      const policyId = '999';

      service.purchasePolicy(policyId, mockPurchasePolicyRequest).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/policies/${policyId}/purchase`);
      req.flush({ error: 'Policy not available' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getUserPolicies', () => {
    it('should get user policies', () => {
      service.getUserPolicies().subscribe(policies => {
        expect(policies).toEqual(mockUserPolicies);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/policies/user/me`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUserPolicies);
    });

    it('should handle getUserPolicies error', () => {
      service.getUserPolicies().subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(401);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/policies/user/me`);
      req.flush({ error: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('cancelPolicy', () => {
    it('should cancel a policy', () => {
      const policyId = '1';
      const cancelledPolicy = { ...mockUserPolicy, status: 'CANCELLED' as const };

      service.cancelPolicy(policyId).subscribe(userPolicy => {
        expect(userPolicy).toEqual(cancelledPolicy);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/policies/user/${policyId}/cancel`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({});
      req.flush(cancelledPolicy);
    });

    it('should handle cancelPolicy error', () => {
      const policyId = '999';

      service.cancelPolicy(policyId).subscribe({
        next: () => fail('Should have failed'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/policies/user/${policyId}/cancel`);
      req.flush({ error: 'Policy not found' }, { status: 404, statusText: 'Not Found' });
    });
  });
});
