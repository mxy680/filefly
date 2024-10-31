import { UnauthorizedException } from '@nestjs/common';

export class NoTokenProvidedException extends UnauthorizedException {
    constructor() {
        super({
            message: 'No access token provided',
            code: 'NO_ACCESS_TOKEN',
        });
    }
}

export class TokenExpiredException extends UnauthorizedException {
  constructor() {
    super({
      message: 'Token expired',
      code: 'TOKEN_EXPIRED',
    });
  }
}

export class InvalidTokenException extends UnauthorizedException {
  constructor() {
    super({
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
    });
  }
}

export class SessionExpiredException extends UnauthorizedException {
  constructor() {
    super({
      message: 'Session expired',
      code: 'SESSION_EXPIRED',
    });
  }
}

export class SessionDoesNotExistException extends UnauthorizedException {
  constructor() {
    super({
      message: 'Session does not exist',
      code: 'SESSION_DOES_NOT_EXIST',
    });
  }
}