import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getStatus() {
    return {
      message: 'TEOMED Backend API',
      status: 'running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/auth/login',
        pacientes: '/pacientes',
        avaliacoes: '/avaliacoes',
        evolucoes: '/evolucoes',
        exames: '/exames-preop',
        receitas: '/receitas'
      }
    };
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }
}
