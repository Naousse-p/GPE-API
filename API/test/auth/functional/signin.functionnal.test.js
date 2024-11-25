const request = require("supertest");
const startServer = require("../../../index"); // Importez startServer directement à partir de index.js
const { User, Role } = require("../../../src/models");
let server;
let authToken;

describe("Signin service functional tests", () => {
  beforeAll(async () => {
    server = await startServer();
  });

  afterAll(async () => {
    await server.close();
  });

  it("should return user, token, refreshToken, and userRoles if email and password are correct", async () => {
    const response = await request(server)
      .post("/api/auth/signin")
      .send({ email: "prof@gmail.com", password: "password123" })
      .expect(200);

    expect(response.body).toHaveProperty("user");
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("refreshToken");
    expect(response.body).toHaveProperty("userRoles");
    expect(response.body.user.email).toBe("prof@gmail.com");
    expect(response.body.userRoles).toContain("professor");
  });

  it("should throw an error if the password is incorrect", async () => {
    const response = await request(server).post("/api/auth/signin").send({ email: "prof@gmail.com", password: "wrongPassword" }).expect(400);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Invalid password");
  });

  it("should throw an error if the email is invalid", async () => {
    const response = await request(server).post("/api/auth/signin").send({ email: "wrongemail@gmail.com", password: "password123" }).expect(404);

    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Email invalid");
  });
});
