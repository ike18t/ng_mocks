---
title: How to mock providers in Angular tests
description: Information how to mock services and tokens in Angular tests with help of ng-mocks
sidebar_label: MockProvider
---

**A mock provider in Angular tests** can be created by `MockProvider` function.
The function supports services and tokens.
Also, it accepts a shape of its service, in order to provide own properties,
and values for tokens, otherwise the token's value will be `undefined`.

```ts
TestBed.configureTestingModule({
  providers: [
    // All methods are empty dummies.
    MockProvider(Service),

    // All methods are empty dummies,
    // but get$() returns EMPTY.
    MockProvider(Service, {
      get$: () => EMPTY,
    }),

    // provides undefined
    MockProvider(TOKEN),

    // provides 'value'
    MockProvider(TOKEN, 'value'),
  ],
});
```

## Simple example

Let's pretend that in an Angular application `TargetComponent` depends on `DependencyService` service,
and, in sake of avoiding overhead, its mock object should be used.

Usually, a test looks like:

```ts
describe('Test', () => {
  let component: TargetComponent;
  let fixture: ComponentFixture<TargetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
      providers: [
        // Annoying dependencies.
        DependencyService,
        ObservableService,
      ],
    });

    fixture = TestBed.createComponent(TargetComponent);
    component = fixture.componentInstance;
  });
});
```

To replace these services with their **mock providers**, simply pass their classes into `MockProvider`:

```ts
TestBed.configureTestingModule({
  declarations: [TargetComponent],
  providers: [
    // profit
    MockProvider(DependencyService),
    MockProvider(ObservableService, {
      prop$: EMPTY,
      getStream$: () => EMPTY,
    }),
  ],
});
```

Or, to be like a pro, use [`MockBuilder`](MockBuilder.md), [`.mock`](MockBuilder.md#mock) method
and call [`MockRender`](MockRender.md):

```ts
describe('Test', () => {
  beforeEach(() => {
    return MockBuilder(TargetComponent)
      .mock(DependencyService)
      .mock(ObservableService, {
        prop$: EMPTY,
        getStream$: () => EMPTY,
      });
  });

  it('should create', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.point.componentInstance).toBeDefined();
  });
});
```

:::warning Please note
The most common error developers meet, when they create mock services, is "**TypeError: Cannot read property 'subscribe' of undefined**".

If we are encountering it too, please read a section called [How to fix TypeError: Cannot read property 'subscribe' of undefined](../troubleshooting/read-property-of-undefined.md).
:::

## Advanced example

An Advanced example of **mocking providers** in Angular tests.
Please, pay attention to comments in the code.

- [Try it on StackBlitz](https://stackblitz.com/github/ng-mocks/examples?file=src/examples/MockProvider/test.spec.ts&initialpath=%3Fspec%3DMockProvider)
- [Try it on CodeSandbox](https://codesandbox.io/s/github/ng-mocks/examples?file=/src/examples/MockProvider/test.spec.ts&initialpath=%3Fspec%3DMockProvider)

```ts
describe('MockProvider', () => {
  const mockObj = { value: 123 };

  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
      imports: [CommonModule],
      providers: [
        MockProvider(Dependency1Service),
        MockProvider(Dependency2Service, { name: 'd2:mock' }),
        MockProvider(UNK_TOKEN, 'mock token'),
        MockProvider(STR_TOKEN, 'mock'),
        MockProvider(OBJ_TOKEN, mockObj),
        MockProvider('pri', 'pri'),
      ],
    }).compileComponents(),
  );

  it('uses mock providers', () => {
    // overriding the token's data that does affect the provided token.
    mockObj.value = 321;
    const fixture = MockRender(TargetComponent);
    const injector = fixture.point.injector;

    expect(injector.get(Dependency1Service).echo())
      .toBeUndefined();
    expect(injector.get(Dependency2Service).echo())
      .toBeUndefined();
    expect(injector.get(OBJ_TOKEN))
      .toBe(mockObj);
    expect(fixture.nativeElement.innerHTML)
      .not.toContain('"target"');
    expect(fixture.nativeElement.innerHTML)
      .toContain('"d2:mock"');
    expect(fixture.nativeElement.innerHTML)
      .toContain('"mock token"');
    expect(fixture.nativeElement.innerHTML)
      .toContain('"mock"');
    expect(fixture.nativeElement.innerHTML)
      .toContain('"value": 321');
    expect(fixture.nativeElement.innerHTML)
      .toContain('"pri"');
  });
});
```
