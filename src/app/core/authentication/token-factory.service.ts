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

    // Check if the token is actually in JWT format before creating a JwtToken
    try {
      if (JwtToken.is(attributes.access_token)) {
        console.log('Valid JWT token detected');
        return new JwtToken(attributes);
      } else {
        console.log('Non-JWT token format detected, using SimpleToken');
        return new SimpleToken(attributes);
      }
    } catch (error) {
      console.error('Error validating token format:', error);
      // Fallback to SimpleToken if there's an error checking the token format
      return new SimpleToken(attributes);
    }
  }
}
