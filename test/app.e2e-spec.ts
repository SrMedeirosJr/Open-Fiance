import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (E2E)', () => {
  let app: INestApplication<App>;
  let token: string;
  let shortCode: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });


  /*** TESTE DE AUTENTICAÇÃO ***/
  it('/users/register (POST) - Deve criar um usuário', async () => {
    const response = await request(app.getHttpServer())
    .post('/users/register')
    .send({
      email: `test${Date.now()}@example.com`, 
      password: '123456',
    })
    .expect(201);

    expect(response.body).toHaveProperty('message');
  });

  it('/users/login (POST) - Deve fazer login e retornar um token', async () => {
    const response = await request(app.getHttpServer())
      .post('/users/login')
      .send({
        email: 'test@example.com',
        password: '123456',
      })
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
    const loginResponse = await request(app.getHttpServer())
      .post('/users/login')
      .send({
      email: 'test@example.com',
      password: '123456',
  });

    const token = loginResponse.body.token;
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

  /*** TESTE DE BUSCA DE URL APÓS EXCLUSÃO ***/
  it('/urls/me (GET) - Não deve listar URLs deletadas', async () => {
    const response = await request(app.getHttpServer())
      .get('/urls/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200); 
  
    response.body.forEach((url) => {
      expect(url).toHaveProperty('deletedAt', null);
    });
  });
});
