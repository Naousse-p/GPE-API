const request = require("supertest");
const startServer = require("../../../index");
const { Appreciation } = require("../../../src/models");

let server;
let authToken;
let authToken2;
let appreciationId;

// Test suite for the "Appreciation create" functionality
describe("Appreciation create functional tests", () => {
  // Runs before all tests in this suite
  beforeAll(async () => {
    // Start the server
    server = await startServer();

    // Sign in as the first user and save their auth token
    const signinResponse = await request(server).post("/api/auth/signin").send({ email: "prof@gmail.com", password: "password123" }).expect(200);

    authToken = signinResponse.body.token;

    // Sign in as the second user and save their auth token
    const signinResponse2 = await request(server).post("/api/auth/signin").send({ email: "naispuig@gmail.com", password: "password123" }).expect(200);
    authToken2 = signinResponse2.body.token;
  });

  // Runs after all tests in this suite
  afterAll(async () => {
    // Delete the created appreciation if it exists
    if (appreciationId) {
      await Appreciation.findByIdAndDelete(appreciationId);
    }

    // Close the server
    await server.close();
  });

  // Create an appreciation for a student successfully
  it("should create appreciation for student successfully", async () => {
    // Appreciation data to send in the request
    const AppreciationData = {
      appreciations: [
        {
          content: "Participation active aux activitÃ©s de groupe.",
          date: "2024-03-20",
          section: "ps",
        },
      ],
    };

    const studentId = "66eeea6cc983d2cbd60d603b";

    // Send POST request to create an appreciation for the student
    const response = await request(server).post(`/api/appreciation/${studentId}`).set("Authorization", `Bearer ${authToken}`).send(AppreciationData).expect(201);

    // Save the appreciation ID for cleanup after tests
    appreciationId = response.body[0]._id;
  });

  // Test case: Error when student ID is not found
  it("should return error for student id not found", async () => {
    // Non-existing student ID
    const studentId = "6639efe7ef8b493f38e27f12";

    // Send POST request with non-existing student ID
    const response = await request(server).post(`/api/appreciation/${studentId}`).set("Authorization", `Bearer ${authToken}`).expect(404);

    // Verify that the response has the correct error message
    expect(response.body.error).toEqual("Student not found");
  });

  // Test case: Forbidden error when the user lacks permissions
  it("should return forbidden error", async () => {
    // Id of a valid student
    const studentId = "66eeea6cc983d2cbd60d603b";

    // Send POST request with the second user's token, expecting a permission error
    const response = await request(server).post(`/api/appreciation/${studentId}`).set("Authorization", `Bearer ${authToken2}`).expect(403);

    // Verify the error message in the response
    expect(response.body.error).toEqual("You don't have permission to access this resource");
  });

  // Test case: Unauthorized error when no token is provided
  it("should return unauthorized error when no token provided", async () => {
    // ID of a valid student
    const studentId = "66eeea6cc983d2cbd60d603b";

    // Send POST request without an authorization token
    const response = await request(server).post(`/api/appreciation/${studentId}`).expect(401);

    // Verify the error message in the response
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toEqual("Access token not provided");
  });
});
