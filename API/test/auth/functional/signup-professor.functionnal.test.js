const request = require("supertest");
const startServer = require("../../../index");
const { User, Professor, Class, School } = require("../../../src/models");

let server;
let createdUserId, createdProfessorId, createdClassId, createdSchoolId;

describe("Signup professor functional test", () => {
    beforeAll(async () => {
        server = await startServer();
    });

    afterAll(async () => {
        if (createdUserId) {
            await User.findByIdAndDelete(createdUserId);
        }
        if (createdProfessorId) {
            await Professor.findByIdAndDelete(createdProfessorId);
        }
        if (createdClassId) {
            await Class.findByIdAndDelete(createdClassId);
        }
        if (createdSchoolId) {
            await School.updateOne(
                { _id: createdSchoolId },
                { $pull: { professor: createdProfessorId } }
            );
        }
        await server.close();
    });

    it("should successfully sign up a professor", async () => {
        const response = await request(server)
            .post("/api/auth/signup-professor")
            .send({
                user: {
                    email: "test_functional_professor@gmail.com",
                    password: "password123",
                    role: "treasurer",
                },
                school: {
                    school_type: "exist",
                    schoolCode: "puigddaddb",
                },
                professor: {
                    lastname: "TestFunctional",
                    firstname: "Professor",
                    phoneNumber: "0109309028",
                },
                classroom: {
                    name: "Class Test Functional",
                    level: "PS",
                    code: "classfunctional123",
                },
            })
            .expect(201);

        const userFromDb = await User.findOne({ email: "test_functional_professor@gmail.com" });
        createdUserId = userFromDb._id;

        const professorFromDb = await Professor.findOne({ lastname: "testfunctional" });
        createdProfessorId = professorFromDb._id.toString();

        const classFromDb = await Class.findOne({ code: "classfunctional123" });
        createdClassId = classFromDb._id;

        const schoolFromDb = await School.findOne({ code: "puigddaddb" });
        createdSchoolId = schoolFromDb._id;

        expect(userFromDb).toHaveProperty("email", "test_functional_professor@gmail.com");
        expect(professorFromDb).toHaveProperty("lastname", "testfunctional");
    });


    it("should return 409 if email is already used", async () => {
        const response = await request(server)
            .post("/api/auth/signup-professor")
            .send({
                user: {
                    email: "test_functional_professor@gmail.com",
                    password: "password123",
                    role: "treasurer",
                },
                school: {
                    school_type: "exist",
                    schoolCode: "schoolcode123",
                },
                professor: {
                    lastname: "Testfunctional",
                    firstname: "Professor",
                    phoneNumber: "0109309028",
                },
                classroom: {
                    name: "Clas test",
                    level: "PS",
                    code: "classfunctional123",
                },
            })
            .expect(409);

        expect(response.body.error).toBe("Email already used");
        const professorFromDb = await Professor.findOne({ lastname: "testfunctional" });
        const professorId = professorFromDb._id.toString();

        if (professorId) {
            await Professor.findByIdAndDelete(professorId);
        }
    });

    it("should return 404 if school is not found", async () => {
        const response = await request(server)
            .post("/api/auth/signup-professor")
            .send({
                user: {
                    email: "newprofessor@gmail.com",
                    password: "password123",
                    role: "treasurer",
                },
                school: {
                    school_type: "exist",
                    schoolCode: "nonexistent_school_code",
                },
                professor: {
                    lastname: "Testfunctional",
                    firstname: "Professor",
                    phoneNumber: "0109309028",
                },
                classroom: {
                    name: "Clas test",
                    level: "PS",
                    code: "classfunctional123",
                },
            })
            .expect(404);

        expect(response.body.error).toBe("School not found");
        const professorFromDb = await Professor.findOne({ lastname: "testfunctional" });
        const professorId = professorFromDb._id.toString();

        if (professorId) {
            await Professor.findByIdAndDelete(professorId);
        }
    });

    it("should return 404 if class is not found", async () => {
        const response = await request(server)
            .post("/api/auth/signup-professor")
            .send({
                user: {
                    email: "newprofessor2@gmail.com",
                    password: "password123",
                    role: "treasurer",
                },
                school: {
                    school_type: "exist",
                    schoolCode: "puigddaddb",
                },
                professor: {
                    lastname: "Testfunctional",
                    firstname: "Professor",
                    phoneNumber: "0109309028",
                },
                classroom: {
                    class_type: "exist",
                    code: "nonexistent_class_code",
                },
            })
            .expect(404);

        expect(response.body.error).toBe("Class not found");
        const professorFromDb = await Professor.findOne({ lastname: "testfunctional" });
        const professorId = professorFromDb._id.toString();

        if (professorId) {
            await Professor.findByIdAndDelete(professorId);
        }
    });

    it("should return 409 if school code is already used", async () => {
        const response = await request(server)
            .post("/api/auth/signup-professor")
            .send({
                user: {
                    email: "newprofessor3@gmail.com",
                    password: "password123",
                    role: "treasurer",
                },
                school: {
                    school_type: "new",
                    schoolCode: "puigddaddb",
                    schoolName: "Test School",
                    schoolAddress: "123 Test St",
                    schoolPostal_code: "12345",
                    schoolCity: "Test City",
                    schoolPhone: "1234567890",
                },
                professor: {
                    lastname: "Testfunctional",
                    firstname: "Professor",
                    phoneNumber: "0109309028",
                },
                classroom: {
                    name: "Clas test",
                    level: "PS",
                    code: "classfunctional123",
                },
            })
            .expect(409);

        expect(response.body.error).toBe("School code already used");
        const professorFromDb = await Professor.findOne({ lastname: "testfunctional" });
        const professorId = professorFromDb._id.toString();

        if (professorId) {
            await Professor.findByIdAndDelete(professorId);
        }
    });

});