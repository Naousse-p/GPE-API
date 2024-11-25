const { student_create_service } = require("../../../src/controllers/student/services");
const { Student, Class } = require("../../../src/models");
const { getOneItem, createItem, getItemById } = require("../../../src/utils/db-generic-services.utils");
const { isIDGood } = require("../../../src/middlewares/handler/is-uuid-good.middleware");
const { saveSourceFile } = require("../../../src/utils/multer");
const crypto = require("crypto");

jest.mock("../../../src/utils/db-generic-services.utils", () => ({
    getOneItem: jest.fn(),
    createItem: jest.fn(),
    getItemById: jest.fn(),
}));

jest.mock("../../../src/middlewares/handler/is-uuid-good.middleware", () => ({
    isIDGood: jest.fn(),
}));

jest.mock("../../../src/utils/multer", () => ({
    saveSourceFile: jest.fn(),
}));

describe("student_create_service", () => {
    const classId = "valid-class-id";
    const req = {
        userId: "valid-user-id",
        file: {
            buffer: Buffer.from("file-buffer"),
        },
    };
    const studentData = {
        firstname: "John",
        lastname: "Doe",
        sexe: "M",
        birthdate: "2005-01-01",
        level: "PS",
    };

    const mockClass = {
        _id: classId,
        professor: [{ user: "valid-user-id" }],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create a student successfully", async () => {
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClass);
        getOneItem.mockResolvedValueOnce(null);
        saveSourceFile.mockResolvedValueOnce("path/to/student-image.jpg");

        const md5Hash = crypto
            .createHash("md5")
            .update(req.file.buffer + studentData.firstname + studentData.birthdate + studentData.lastname + classId)
            .digest("hex");

        const createdStudent = {
            ...studentData,
            class: classId,
            md5: md5Hash,
            _id: "new-student-id",
        };

        createItem.mockResolvedValueOnce(createdStudent);

        const result = await student_create_service(
            studentData.lastname,
            studentData.firstname,
            studentData.sexe,
            studentData.birthdate,
            studentData.level,
            classId,
            req
        );

        expect(isIDGood).toHaveBeenCalledWith(classId);
        expect(getItemById).toHaveBeenCalledWith(Class, classId, "professor");
        expect(getOneItem).toHaveBeenCalledWith(Student, {
            md5: md5Hash,
            firstname: studentData.firstname,
            birthdate: studentData.birthdate,
            lastname: studentData.lastname,
        });
        expect(result).toEqual(createdStudent);
    });

    it("should throw a 409 error if the student already exists", async () => {
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClass);

        const existingStudent = {
            ...studentData,
            md5: "existing-md5-hash",
        };

        getOneItem.mockResolvedValueOnce(existingStudent);

        await expect(
            student_create_service(
                studentData.lastname,
                studentData.firstname,
                studentData.sexe,
                studentData.birthdate,
                studentData.level,
                classId,
                req
            )
        ).rejects.toEqual({
            code: 409,
            message: "Student already exists",
        });
    });

    it("should throw a 403 error if the user does not have permission for the class", async () => {
        const mockClassWithoutAccess = {
            _id: classId,
            professor: [{ user: "another-user-id" }],
        };

        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClassWithoutAccess);

        await expect(
            student_create_service(
                studentData.lastname,
                studentData.firstname,
                studentData.sexe,
                studentData.birthdate,
                studentData.level,
                classId,
                req
            )
        ).rejects.toEqual({
            code: 403,
            message: "You don't have permission to access this resource",
        });
    });

    it("should throw a 422 error if no source file is provided", async () => {
        const reqWithoutFile = { ...req, file: null };
        isIDGood.mockResolvedValueOnce(classId);
        getItemById.mockResolvedValueOnce(mockClass);

        await expect(
            student_create_service(
                studentData.lastname,
                studentData.firstname,
                studentData.sexe,
                studentData.birthdate,
                studentData.level,
                classId,
                reqWithoutFile
            )
        ).rejects.toEqual({
            code: 422,
            message: "Source file is required",
        });
    });
});