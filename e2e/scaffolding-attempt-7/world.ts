import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, APIRequestContext, chromium, request as playwrightRequest } from '@playwright/test';

export interface ScaffoldingWorld extends World {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  apiContext: APIRequestContext;
  lastResponse: Awaited<ReturnType<APIRequestContext['get']>> | null;
  appUrl: string;
  lastBuildExitCode: number;
}

class ScaffoldingWorldImpl extends World implements ScaffoldingWorld {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  apiContext!: APIRequestContext;
  lastResponse: Awaited<ReturnType<APIRequestContext['get']>> | null = null;
  appUrl: string = process.env.APP_URL || 'http://localhost:3000';
  lastBuildExitCode: number = -1;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(ScaffoldingWorldImpl);