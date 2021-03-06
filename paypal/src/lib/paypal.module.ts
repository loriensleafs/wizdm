import { NgModule, ModuleWithProviders, Inject, Optional } from '@angular/core';
import { loadPayPalSdk, PAYPAL_CONFIG, PAYPAL_INSTANCE } from './paypal-factory';
import { PayPal, PayPalConfig } from './types/paypal';
import { PayPalButtons } from './paypal.component';

/** @dynamic - tells ngc to ignore the error on potentially unknown types generated by strictEmitMetadata: true */
@NgModule({
  declarations: [ PayPalButtons ],
  exports: [ PayPalButtons ]
})
export class PayPalModule {

  /** Global script loading promise to be use as initializer */
  private static _paypal: Promise<PayPal>;

  constructor(@Optional() @Inject(PAYPAL_CONFIG) config: PayPalConfig) {

    if(!config){ throw new Error(`
      PayPal module has not been initialized.
      Make sure to call PayPalModule.init(...) in your root module.
    `);}

    // Triggers the paypal.js API loading asyncronously.
    PayPalModule._paypal = loadPayPalSdk(config);
  }

  static init(config: PayPalConfig): ModuleWithProviders<PayPalModule> {
    return {
      ngModule: PayPalModule,
      providers: [
        /** Provides the global PayPalConfig object */
        { provide: PAYPAL_CONFIG, useValue: config },
        /** Provides the global paypal instance */
        { provide: PAYPAL_INSTANCE, useFactory: () => PayPalModule._paypal }
      ]
    };
  }
}