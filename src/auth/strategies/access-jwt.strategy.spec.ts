import { JwtStrategy } from './access-jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user payload with id and role', async () => {
      const payload = {
        id: 'user-id-123',
        role: 'USER',
        iat: 123456789,
        exp: 123459999,
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: 'user-id-123',
        role: 'USER',
      });
    });
  });
});
