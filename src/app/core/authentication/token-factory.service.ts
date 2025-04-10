import { Injectable } from '@angular/core';
import { Token } from './interface';
import { JwtToken, SimpleToken } from './token';

@Injectable({
  providedIn: 'root',
})
export class TokenFactory {
  create(attributes?: Token) {
    if (!attributes) {
      return;
    }

    return this.createByAccessToken(attributes) || new SimpleToken(attributes);
  }

  private createByAccessToken(attributes: Token) {
    if (!attributes.access_token) {
      return;
    }

    // In our case, we're always using JWT tokens
    return new JwtToken(attributes);
  }
}
