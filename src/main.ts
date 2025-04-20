import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {
  LOCALE_ID,
  importProvidersFrom,
  mergeApplicationConfig,
  ApplicationConfig,
} from '@angular/core';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import localeEn from '@angular/common/locales/en';
import localeEnExtra from '@angular/common/locales/extra/en';
import { registerLocaleData } from '@angular/common';

// Register the locale data
registerLocaleData(localeEn, 'en-US', localeEnExtra);

// Create additional configuration with locale providers
const localeConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'en-US' },
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
    importProvidersFrom(MatNativeDateModule),
  ],
};

// Merge with existing appConfig
const mergedConfig = mergeApplicationConfig(appConfig, localeConfig);

// Bootstrap with merged configuration
bootstrapApplication(AppComponent, mergedConfig).catch(err => console.error(err));
