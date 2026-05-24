import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import {
  Browser,
  BrowserContext,
  Page,
  APIRequestContext,
  chromium,
  request as playwrightRequest,
} from '@playwright/test';

export interface ScaffoldingWorld extends World {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  apiRequest: APIRequestContext;
  appUrl: string;
  lastResponse: import('@playwright/test').APIResponse | null;
}

class CustomWorld extends World implements ScaffoldingWorld {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  apiRequest!: APIRequestContext;
  appUrl: string;
  lastResponse: import('@playwright/test').APIResponse | null = null;

  constructor(options: IWorldOptions) {
    super(options);
    this.appUrl = process.env.APP_URL || 'http://localhost:3000';
  }
}

setWorldConstructor(CustomWorld);