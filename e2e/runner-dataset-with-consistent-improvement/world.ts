import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium, Route } from 'playwright';

export interface CustomWorld extends World {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  appUrl: string;
}

export class RunnerWorld extends World implements CustomWorld {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  appUrl: string = process.env.APP_URL || 'http://localhost:3000';

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(RunnerWorld);