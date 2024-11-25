const { appreciation_update_service } = require("../../../src/controllers/appreciation/services");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const { getItemById, updateItem } = require("../../../src/utils/db-generic-services.utils");
const { Student, Appreciation, Professor } = require("../../../src/models");
const mongoose = require("mongoose");

// Mock the utility functions and middleware
jest.mock("../../../src/utils/db-generic-services.utils", () => ({
  getItemById: jest.fn(),
  updateItem: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
  isIDGood: jest.fn(),
}));

// Test suite for the appreciation_update_service function
describe("appreciation_update_service", () => {
  // Define test data and mock objects
  const validProfessorId = new mongoose.Types.ObjectId();
  const validProfessorUserId = new mongoose.Types.ObjectId();
  let req, appreciationData, studentMock, appreciationMock, professorMock, notValidProfessorMock;

  beforeEach(() => {
    // Mock request object with user ID of a valid professor
    req = {
      userId: validProfessorUserId.toString(),
    };

    // Data for updating the appreciation
    appreciationData = {
      content: "L'élève a montré une amélioration continue en mathématiques.",
      date: "2023-11-01",
      section: "ps",
    };

    // Mocked student object
    studentMock = {
      _id: "validStudentId",
      class: {
        professor: [validProfessorId],
      },
    };

    // Mocked appreciation object
    appreciationMock = {
      _id: "validAppreciationId",
      student: "validStudentId",
      user: validProfessorUserId,
    };

    // Mocked professor object
    professorMock = {
      _id: validProfessorId,
      user: validProfessorUserId,
    };

    // Mock object representing an invalid professor
    notValidProfessorMock = {
      _id: validProfessorId,
      user: "not-valid-professor",
    };

    // Clear all mock call history
    jest.clearAllMocks();
  });

  // Test case: Successfully update an appreciation
  it("should update the appreciation successfully", async () => {
    // Setup mocks to return valid data for each call
    isIDGood.mockResolvedValue("validStudentId");
    getItemById.mockResolvedValueOnce(studentMock).mockResolvedValueOnce(professorMock);
    getItemById.mockResolvedValueOnce(appreciationMock);
    updateItem.mockResolvedValue(appreciationMock);

    // Call the appreciation update service
    const result = await appreciation_update_service("validStudentId", "validAppreciationId", appreciationData, req);

    // Expectations: Ensure each function was called correctly
    expect(isIDGood).toHaveBeenCalledWith("validStudentId");
    expect(getItemById).toHaveBeenCalledWith(Student, "validStudentId", "class");
    expect(result).toEqual(appreciationMock);
  });

  // Test case: Throw 404 error if student is not found
  it("should throw a 404 error if the student is not found", async () => {
    // Mock student lookup to return null, indicating not found
    isIDGood.mockResolvedValue("validStudentId");
    getItemById.mockResolvedValueOnce(null);

    // Call appreciation update service and expect a 404 error
    await expect(appreciation_update_service("validStudentId", "validAppreciationId", appreciationData, req)).rejects.toEqual({
      code: 404,
      message: "Student not found",
    });
  });

  // Test case: Throw 403 error if professor lacks access to the student
  it("should throw a 403 error if the professor does not have access to the student", async () => {
    // Mock unauthorized student object (student associated with another professor)
    const unauthorizedStudentMock = {
      _id: "validStudentId",
      class: { professor: ["anotherProfessorId"] },
    };

    // Setup mocks to return unauthorized data
    isIDGood.mockResolvedValue("validStudentId");
    getItemById.mockResolvedValueOnce(unauthorizedStudentMock);
    getItemById.mockResolvedValueOnce(notValidProfessorMock);

    // Call appreciation update service and expect a 403 error
    await expect(appreciation_update_service("validStudentId", "validAppreciationId", appreciationData, req)).rejects.toEqual({
      code: 403,
      message: "You don't have permission to access this resource",
    });
  });

  // Test case: Throw 404 error if appreciation is not found
  it("should throw a 404 error if the appreciation is not found", async () => {
    // Mock appreciation lookup to return null, indicating not found
    isIDGood.mockResolvedValue("validStudentId");
    getItemById.mockResolvedValueOnce(studentMock).mockResolvedValueOnce(professorMock).mockResolvedValueOnce(null);

    // Call appreciation update service and expect a 404 error
    await expect(appreciation_update_service("validStudentId", "validAppreciationId", appreciationData, req)).rejects.toEqual({
      code: 404,
      message: "Appreciation not found",
    });
  });
});
