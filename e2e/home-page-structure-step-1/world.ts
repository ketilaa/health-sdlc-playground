import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, Page } from 'playwright';

export interface CustomWorld extends World {
  browser: Browser;
  page: Page;
}

class HomePageWorld extends World implements CustomWorld {
  browser!: Browser;
  page!: Page;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(HomePageWorld);