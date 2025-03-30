const app = require('../app');
const request = require('supertest');
const { User } = require('../models/index');

describe('/user/register', () => {
    it('GET - should return status 302 and render /register', async () => {
      const response = await request(app).get('/register');
    
      // Check if status is 302
      expect(response.status).toBe(302);
    });

    it('POST - when given a unique username and a strong password, should return 302', async() => {
        
        const uniqueUsername = toString(Math.floor(Math.random() * (999999 - 1 + 1)) + 1);
        const strongPassword = "12345678";

        

        const res = await request(app)
        .post('/user/register')
        .send({ username: uniqueUsername, password: strongPassword });
        
        expect(res.status).toBe(302);

          
    });

    it('POST - when given a blank username and password, it should return 302', async() => {
        
      const uniqueUsername = "";
      const strongPassword = "";
      const usersBefore = User.findAll();
      const lengthBefore = usersBefore.length;
      

      const res = await request(app)
        .post('/user/register')
        .send({ username: uniqueUsername, password: strongPassword });
      
      expect(res.status).toBe(302);

        
    });

    it('POST - when given a username that already exists and a password, it should return 302', async() => {
        
      const uniqueUsername = 'samuel1';
      const strongPassword = "12345678";
      

      const res = await request(app)
        .post('/user/register')
        .send({ username: uniqueUsername, password: strongPassword });
      
      expect(res.status).toBe(302);

    });
  });

  describe('/user/login', () => {
    it('GET - should return status 302 and render /login', async () => {
      const response = await request(app).get('/login');
    
      // Check if status is 302
      expect(response.status).toBe(302);
    });

    it('POST - when given a correct username and password, should return 302', async() => {
        
        const uniqueUsername = 'samuel1';
        const strongPassword = "12345678";
        
        const res = await request(app)
        .post('/user/login')
        .send({ username: uniqueUsername, password: strongPassword });
        
        expect(res.status).toBe(302);
    });

    it('POST - when given a blank username and password, it should return 302', async() => {
        
      const uniqueUsername = '';
      const strongPassword = "";


      const res = await request(app)
        .post('/user/login')
        .send({ username: uniqueUsername, password: strongPassword });
      
      expect(res.status).toBe(302);

    });

    it('POST - when given a username that exists but an password, it should return 302', async() => {
        
      const uniqueUsername = 'toString(Math.floor(Math.random() * (999999 - 1 + 1)) + 1)';
      const strongPassword = "12345678";
      const usersBefore = User.findAll();
      const lengthBefore = usersBefore.length;
      

      const res = await request(app)
        .post('/user/login')
        .send({ username: uniqueUsername, password: strongPassword });
      
      expect(res.status).toBe(302);


    });
  });