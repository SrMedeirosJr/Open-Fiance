import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (E2E)', () => {
  let app: INestApplication<App>;
  let token: string;
  let shortCode: string;
  const testUser = {
    email: 'test@example.com',
    password: '123456',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // ✅ 1. Zeramos o banco antes de rodar os testes para evitar conflitos
    await request(app.getHttpServer()).post('/migrations/revert');
    await request(app.getHttpServer()).post('/migrations/run');

    // ✅ 2. Removemos usuários e URLs antes de criar um novo
    await request(app.getHttpServer()).delete('/users/cleanup');
    await request(app.getHttpServer()).delete('/urls/cleanup');

    // ✅ 3. Criamos o usuário APENAS se ele ainda não existir
    await request(app.getHttpServer())
      .post('/users/register')
      .send(testUser)
      .expect((res) => {
        if (res.status === 409) {
          console.log('Usuário já existente. Prosseguindo para login...');
        } else {
          expect(res.status).toBe(201);
        }
      });

    // ✅ 4. Fazemos login e armazenamos o token
    const loginResponse = await request(app.getHttpServer())
      .post('/users/login')
      .send(testUser)
      .expect(201);

    token = loginResponse.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  /*** TESTE DE AUTENTICAÇÃO ***/
  it('/users/login (POST) - Deve fazer login e retornar um token', async () => {
    const response = await request(app.getHttpServer())
      .post('/users/login')
      .send(testUser)
      .expect(201);

    expect(response.body).toHaveProperty('token');
    token = response.body.token;
  });

  /*** TESTE DE ENCURTAMENTO DE URL ***/
  it('/urls (POST) - Deve encurtar uma URL', async () => {
    const response = await request(app.getHttpServer())
      .post('/urls')
      .set('Authorization', `Bearer ${token}`)
      .send({ originalUrl: 'https://example.com' })
      .expect(201);

    expect(response.body).toHaveProperty('shortCode');
    shortCode = response.body.shortCode;
  });

  /*** TESTE PARA BUSCAR AS URLS DO USUÁRIO ***/
  it('/urls/me (GET) - Deve retornar as URLs encurtadas do usuário', async () => {
    const response = await request(app.getHttpServer())
      .get('/urls/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.length).toBeGreaterThan(0);
  });

  /*** TESTE PARA DELETAR UMA URL ***/
  it('/urls/:shortCode (DELETE) - Deve deletar uma URL', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/urls/${shortCode}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'URL excluída com sucesso.');
  });
});
