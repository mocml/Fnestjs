import { Test } from '@nestjs/testing'
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum'
import { AuthDTO } from '../src/auth/dto';
import { EditUserDto } from 'src/user/dto';
const BASE_URL = 'http://localhost:3000';

describe('App e2e', () => {
  let app: INestApplication
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true
      }),
    );

    await app.init();
    await app.listen(3000)
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl(BASE_URL)
  });

  afterAll(async () => {
    await app.close()
  });

  describe('Auth', () => {
    const payload: AuthDTO = {
      email: 'vanhv@gmail.com',
      pass: 'vanhvs',
    }
    describe('Register', () => {
      it('Register', () => {
        return pactum.spec()
          .post('/auth/register')
          .withBody(payload)
          .expectStatus(201)
      })
    });
    describe('Login', () => {
      it('Throw when wrong payload:less pass', () => {
        return pactum.spec()
          .post('/auth/login')
          .withBody({
            email: payload.email,
          })
          .expectStatus(400)
      })
      it('Login', () => {
        const payload: AuthDTO = {
          email: 'vanhv@gmail.com',
          pass: 'vanhvs',
        }
        return pactum.spec()
          .post('/auth/login')
          .withBody(payload)
          .expectStatus(200)
          .stores('userStore', 'access_token')
      })
    });
  })
  describe('User', () => {
    describe('UserProfile', () => {
      it('get User profile', () => {
        return pactum.spec()
          .get('/user/profile')
          .withBearerToken(`$S{userStore}`)
          .expectStatus(200)
      });
      const id = 1;
      it('Get User by ParamID', () => {
        return pactum.spec()
          .get('/user/profileById')
          .withQueryParams('id', 10)
          .expectStatus(200)
      })
      it('Get User by Email', () => {
        return pactum.spec()
          .get('/user/profileByEmail')
          .withQueryParams('email', 'vanhv@gmail.com')
          .expectStatus(200)
      })
    });
    describe('EditUser', () => {
      it('Edit User profile', () => {
        const payload: EditUserDto = {
          firstName: 'van',
          lastName: 'ha',
        }
        return pactum.spec()
          .patch('/user/edit-profile')
          .withBody(payload)
          .withBearerToken(`$S{userStore}`)
          .expectStatus(200)
          .expectBodyContains(payload.firstName)
          .expectBodyContains(payload.lastName)
      })
    });
  })
  describe('Bookmarks', () => {
    describe('CreateBookmark', () => {

    });
    describe('GetBookmark', () => {

    });
    describe('GetBookMarkById', () => {

    });
    describe('EditBookmark', () => {

    });
    describe('DeleteBookmark', () => {

    });
  })
})