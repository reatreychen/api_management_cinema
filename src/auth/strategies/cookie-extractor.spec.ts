import { cookieExtractor } from './cookie-extractor';

describe('cookieExtractor', () => {
  it('should extract access_token from cookies if present', () => {
    const req = {
      cookies: {
        access_token: 'valid-cookie-token',
      },
    };
    expect(cookieExtractor(req)).toBe('valid-cookie-token');
  });

  it('should return null if req is null or undefined', () => {
    expect(cookieExtractor(null)).toBeNull();
    expect(cookieExtractor(undefined)).toBeNull();
  });

  it('should return null if cookies object is not present', () => {
    const req = {};
    expect(cookieExtractor(req)).toBeNull();
  });

  it('should return undefined or null if access_token cookie is missing', () => {
    const req = { cookies: {} };
    expect(cookieExtractor(req)).toBeUndefined();
  });
});
