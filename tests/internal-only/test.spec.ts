import { MockBuilder, MockRender } from 'ng-mocks';

import { InternalComponent } from './fixtures.components';
import { TargetModule } from './fixtures.modules';
import { testBedInjector } from '../utils/test-bed-injector';

describe('InternalOnly:real', () => {
  beforeEach(() => MockBuilder(TargetModule));

  it('should render', () => {
    expect(() => {
      MockRender(InternalComponent);
      testBedInjector(InternalComponent); // Thanks Ivy True, it doesn't throw an error and we have to use injector.
    }).toThrowError();
  });
});

describe('InternalOnly:mock', () => {
  beforeEach(async done => {
    await MockBuilder().mock(TargetModule).mock(InternalComponent, { export: true });
    done();
  });

  // The expectation is to see that InternalComponent was exported and can be accessed from the test.
  it('should render', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture).toBeDefined();
    const content = fixture.debugElement.nativeElement.innerHTML;
    expect(content).toEqual('<internal-component></internal-component>');
  });
});
