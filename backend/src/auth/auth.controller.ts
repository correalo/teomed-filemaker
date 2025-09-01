import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Autenticar usuário', description: 'Autentica um usuário com username e password e retorna um token JWT' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'admin' },
        password: { type: 'string', example: 'teomed2024' }
      },
      required: ['username', 'password']
    }
  })
  @ApiResponse({ status: 200, description: 'Usuário autenticado com sucesso', schema: {
    type: 'object',
    properties: {
      access_token: { type: 'string' },
      user: { 
        type: 'object',
        properties: {
          username: { type: 'string' },
          name: { type: 'string' }
        }
      }
    }
  }})
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: { username: string; password: string }) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    
    return this.authService.login(user);
  }
}
