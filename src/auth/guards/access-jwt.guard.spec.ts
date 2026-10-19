import { Reflector } from '@nestjs/core';
import { AcessJwtGuard } from './access-jwt.guard';
import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

describe('AcessJwtGuard', () => {
  let guard: AcessJwtGuard;
  let reflector: jest.Mocked<Partial<Reflector>>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    };
    guard = new AcessJwtGuard(reflector as Reflector);
  });

  it('should allow access if route has @Public decorator', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);

    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('should delegate to super.canActivate if route is not public', () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);

    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({}),
        getResponse: jest.fn().mockReturnValue({}),
      }),
    } as unknown as ExecutionContext;

    jest.spyOn(AuthGuard('access-jwt').prototype, 'canActivate').mockReturnValue(true as any);

    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });
});
