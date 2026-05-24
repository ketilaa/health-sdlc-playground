import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, APIRequestContext, chromium, request as playwrightRequest } from '@playwright/test';

export interface AppWorld extends World {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  apiRequest: APIRequestContext;
  response: Awaited<ReturnType<APIRequestContext['get']>> | null;
  appUrl: string;
}

class CustomWorld extends World implements AppWorld {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  apiRequest!: APIRequestContext;
  response: Awaited<ReturnType<APIRequestContext['get']>> | null = null;
  appUrl: string;

  constructor(options: IWorldOptions) {
    super(options);
    this.appUrl = process.env.APP_URL || 'http://localhost:3000';
  }

  async init() {
    this.browser = await chromium.launch({ headless: true });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    this.apiRequest = await playwrightRequest.newContext({
      baseURL: this.appUrl,
    });
  }

  async teardown() {
    await this.page.close();
    await this.context.close();
    await this.browser.close();
    await this.apiRequest.dispose();
  }
}

setWorldConstructor(CustomWorld);