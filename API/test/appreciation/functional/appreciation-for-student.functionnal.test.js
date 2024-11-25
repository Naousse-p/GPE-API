const request = require("supertest");
const startServer = require("../../../index");
let server;
let authToken;
let authToken2;
let authOtherToken;

describe("Appreciation for student functional tests", () => {
  beforeAll(async () => {
    server = await startServer();
    const signinResponse = await request(server)
      .post("/api/auth/signin")
      .send({ email: "prof@gmail.com", password: "password123" })
      .expect(200);

    authToken = signinResponse.body.token;

    const signinResponse2 = await request(server)
      .post("/api/auth/signin")
      .send({ email: "naispuig@gmail.com", password: "password123" })
      .expect(200);
    authToken2 = signinResponse2.body.token;

    const signinOtherResponse = await request(server)
      .post("/api/auth/signin")
      .send({ email: "roux_vincent@gmail.com", password: "password123" })
      .expect(200);

    authOtherToken = signinOtherResponse.body.token;

  });

  afterAll(async () => {
    await server.close();
  });


  it('should get appreciation for student successfully', async () => {
    const studentId = "66eeea6cc983d2cbd60d603b";
    const response = await request(server)
      .get(`/api/appreciation/${studentId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });

  it('should return error for student id not found', async () => {
    const studentId = "6639efe7ef8b493f38e27f12";
    const response = await request(server)
      .get(`/api/appreciation/${studentId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);

    expect(response.body.error).toEqual('Student not found');
  });

  it('should return forbidden error', async () => {
    const studentId = "66eeea6cc983d2cbd60d603b";
    const response = await request(server)
      .get(`/api/appreciation/${studentId}`)
      .set('Authorization', `Bearer ${authOtherToken}`)
      .expect(403);

    expect(response.body.error).toEqual("You don't have permission to access this resource");
  });

  it('should return unauthorized error when no token provided', async () => {
    const studentId = "66eeea6cc983d2cbd60d603b";
    const response = await request(server)
      .get(`/api/appreciation/${studentId}`)
      .expect(401);

    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toEqual('Access token not provided');
  });
});
