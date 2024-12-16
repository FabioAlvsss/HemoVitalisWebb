import { TestBed } from '@angular/core/testing';

import { hemovitalisService } from './hemovitalis.service';

describe('HemovitalisService', () => {
  let service: hemovitalisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(hemovitalisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
