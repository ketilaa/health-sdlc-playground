import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, Page, BrowserContext } from 'playwright';

export interface CustomWorldOptions extends IWorldOptions {
  browser?: Browser;
  page?: Page;
  context?: BrowserContext;
}

export class CustomWorld extends World {
  browser?: Browser;
  page?: Page;
  context?: BrowserContext;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);