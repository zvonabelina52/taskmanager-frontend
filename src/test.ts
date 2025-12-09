import { getTestBed } from '@angular/core/testing';
import { beforeAll, afterEach } from 'vitest';

let testBed: any;

beforeAll(async () => {
  testBed = getTestBed();
  
  // Use dynamic import for ES modules
  const testingModule = await import('@angular/platform-browser-dynamic/testing');
  const BrowserDynamicTestingModule = testingModule.BrowserDynamicTestingModule;
  const platformBrowserDynamicTesting = testingModule.platformBrowserDynamicTesting;
  
  testBed.initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting(),
    {
      teardown: { destroyAfterEach: true }
    }
  );
});

afterEach(() => {
  testBed.resetTestingModule();
  localStorage.clear();
  sessionStorage.clear();
});
