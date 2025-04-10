import { base64, capitalize, currentTimestamp, timeLeft } from './helpers';
import { Token } from './interface';

export abstract class BaseToken {
  constructor(protected attributes: Token) {}

  get access_token() {
    return this.attributes.access_token;
  }

  get refresh_token() {
    return this.attributes.refresh_token;
  }

  get token_type() {
    return this.attributes.token_type ?? 'bearer';
  }

  get exp() {
    return this.attributes.exp;
  }

  get customerId() {
    return this.attributes.customerId;
  }

  valid() {
    return this.hasAccessToken() && !this.isExpired();
  }

  getBearerToken() {
    return this.access_token
      ? [capitalize(this.token_type), this.access_token].join(' ').trim()
      : '';
  }

  needRefresh() {
    return this.exp !== undefined && this.exp >= 0;
  }

  getRefreshTime() {
    return timeLeft((this.exp ?? 0) - 5);
  }

  private hasAccessToken() {
    return !!this.access_token;
  }

  private isExpired() {
    return this.exp !== undefined && this.exp - currentTimestamp() <= 0;
  }
}

export class SimpleToken extends BaseToken {}

export class JwtToken extends SimpleToken {
  private _payload?: { exp?: number; sub?: string };

  static is(accessToken: string): boolean {
    try {
      const [_header] = accessToken.split('.');
      const header = JSON.parse(base64.decode(_header));

      return header.typ.toUpperCase().includes('JWT');
    } catch (e) {
      return false;
    }
  }

  get exp() {
    return this.payload?.exp;
  }

  // For JWT tokens, the customerId is in the 'sub' claim
  get customerId() {
    return this.payload?.sub || this.attributes.customerId;
  }

  private get payload(): { exp?: number; sub?: string } {
    if (!this.access_token) {
      return {};
    }

    if (this._payload) {
      return this._payload;
    }

    try {
      const [, payload] = this.access_token.split('.');
      if (!payload) return {};
      
      const data = JSON.parse(base64.decode(payload));
      if (!data.exp) {
        data.exp = this.attributes.exp;
      }

      return (this._payload = data);
    } catch (e) {
      console.error('Error parsing JWT payload:', e);
      return {};
    }
  }
}