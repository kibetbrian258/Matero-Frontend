import { Injectable, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Subscription, share } from 'rxjs';

import { LocalStorageService } from '@shared';
import { currentTimestamp, filterObject } from './helpers';
import { Token } from './interface';
import { BaseToken } from './token';
import { TokenFactory } from './token-factory.service';

@Injectable({
  providedIn: 'root',
})
export class TokenService implements OnDestroy {
  private readonly key = 'secure-bank-token';

  private readonly store = inject(LocalStorageService);
  private readonly factory = inject(TokenFactory);

  private readonly change$ = new BehaviorSubject<BaseToken | undefined>(undefined);

  private _token?: BaseToken;

  private get token(): BaseToken | undefined {
    if (!this._token) {
      this._token = this.factory.create(this.store.get(this.key));
    }

    return this._token;
  }

  change() {
    return this.change$.pipe(share());
  }

  set(token?: Token) {
    this.save(token);
    return this;
  }

  clear() {
    this.save();
  }

  valid() {
    return this.token?.valid() ?? false;
  }

  getBearerToken() {
    return this.token?.getBearerToken() ?? '';
  }
  
  getCustomerId() {
    return this.token?.customerId;
  }

  // Added method to get time until token expiration in seconds
  getExpiresIn(): number | undefined {
    if (!this.token?.exp) return undefined;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return this.token.exp - currentTime;
  }

  ngOnDestroy(): void {
    // No refresh timers 
  }

  private save(token?: Token) {
    this._token = undefined;

    if (!token) {
      this.store.remove(this.key);
    } else {
      const value = Object.assign({ access_token: '', token_type: 'Bearer' }, token, {
        exp: token.expires_in ? currentTimestamp() + token.expires_in : undefined,
        customerId: token.customerId
      });
      this.store.set(this.key, filterObject(value));
    }

    this.change$.next(this.token);
  }
}