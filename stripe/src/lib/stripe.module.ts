import { STRIPE_PUBLIC_KEY, STRIPE_OPTIONS, STRIPEJS, StripeService } from './stripe.service';
import { NgModule, ModuleWithProviders, Inject, Optional, NgZone } from '@angular/core';
import { loadStripeJS } from './stripe-loader';

import type { StripeConstructor, StripeConstructorOptions } from '@stripe/stripe-js';

/** @dynamic - tells ngc to ignore the error on potentially unknown types generated by strictEmitMetadata: true */
@NgModule({
  providers: [ StripeService ]
})
export class StripeModule {

  private static _stripejs: Promise<StripeConstructor>;

  constructor(@Optional() @Inject(STRIPE_PUBLIC_KEY) publicKey, zone: NgZone) {

    if(!publicKey) { throw new Error(`
      Stripe module has not been initialized.
      Make sure to call StripeModule.init('pk_xxxxxxxxx') in your root or feature module.
    `);}

    // Triggers the stripe.js API loading asyncronously.
    if(!StripeModule._stripejs) {
      // Loads the Stripe.js avoiding to trigger change detection     
      StripeModule._stripejs = zone.runOutsideAngular( () => loadStripeJS() ); 
    }
  }

  static init(publicKey: string, options?: StripeConstructorOptions): ModuleWithProviders<StripeModule> {
    return {
      ngModule: StripeModule,
      providers: [
        
        /** Provides the global Stripe public key */
        { provide: STRIPE_PUBLIC_KEY, useValue: publicKey },

        /** Provides the global stripe options */
        { provide: STRIPE_OPTIONS, useValue: options },

        /** Provides StripeJS as an injectable promise */ 
        { provide: STRIPEJS, useFactory: () => StripeModule._stripejs }
      ]
    };
  } 
}