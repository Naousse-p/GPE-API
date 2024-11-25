const request = require("supertest");
const startServer = require("../../../index");
const { User, Parent, Student, Role } = require("../../../src/models");

let server;
let studentId = "66dffee0385e06dab1d7d0e0";
let classId = "66d97f2c12abb2fb62c89cad";
let createdUserId;
let createdParentId;

describe("Signup parent service functional tests", () => {
    beforeAll(async () => {
        server = await startServer();
    });

    afterAll(async () => {
        if (createdUserId) {
            await User.deleteOne({ _id: createdUserId });
        }
        if (createdParentId) {
            await Parent.deleteOne({ _id: createdParentId });
        }

        if (studentId && createdParentId) {
            await Student.updateOne(
                { _id: studentId },
                { $pull: { parent: createdParentId } }
            );
        }

        await server.close();
    });

    it("should successfully sign up a parent", async () => {
        const response = await request(server)
            .post("/api/auth/signup-parent")
            .send({
                user: {
                    email: "test@gmail.com",
                    password: "password123",
                    role: "parents",
                },
                parent: {
                    lastname: "test functionnal",
                    firstname: "test functionnal",
                    phoneNumber: "0109309028",
                    children: {
                        child: studentId,
                        class: classId,
                        relationship: "mother",
                    },
                },
            })
            .expect(201);

        const user = await User.findOne({ email: "test@gmail.com" });
        createdUserId = user._id;

        const parent = await Parent.findOne({ user: createdUserId });
        createdParentId = parent._id;

        expect(user).toHaveProperty("email", "test@gmail.com");
        expect(user).toHaveProperty("roles");

        expect(parent).toHaveProperty("lastname", "test functionnal");
        expect(parent).toHaveProperty("firstname", "test functionnal");
        expect(parent).toHaveProperty("phoneNumber", "0109309028");
    });

    it("should return 409 if the email is already used", async () => {
        const response = await request(server)
            .post("/api/auth/signup-parent")
            .send({
                user: {
                    email: "naiis@gmail.com",
                    password: "password123",
                    role: "parents",
                },
                parent: {
                    lastname: "Test",
                    firstname: "Test",
                    phoneNumber: "0109309028",
                    children: {
                        child: studentId,
                        class: classId,
                        relationship: "mother",
                    },
                },
            })
            .expect(409);

        expect(response.body.error).toBe("Email already used");
    });

    it("should return 404 if the student does not exist", async () => {
        const invalidStudentId = "66e1f09244f76fc0b88652a3";

        const response = await request(server)
            .post("/api/auth/signup-parent")
            .send({
                user: {
                    email: "newuser@gmail.com",
                    password: "password123",
                    role: "parents",
                },
                parent: {
                    lastname: "Test",
                    firstname: "Test",
                    phoneNumber: "0109309028",
                    children: {
                        child: invalidStudentId,
                        class: classId,
                        relationship: "mother",
                    },
                },
            })
            .expect(404);

        expect(response.body.error).toBe("Student not found");
    });
});