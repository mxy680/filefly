import { Param, Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  
  @HttpCode(HttpStatus.OK)
  @Get('/:provider')
  signIn(@Param('provider') provider: string) {
    return this.authService.signIn(provider);
  }
}
