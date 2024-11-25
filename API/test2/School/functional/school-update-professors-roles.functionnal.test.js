const request = require("supertest");
const startServer = require("../../../index");

let server;
let authTokenDirector;
let authTokenProfessor;
let authOtherToken;
let schoolId = "66ec246c4119bdd149977895";
let professorId = "66eee6e9a3c7c5bfd3c2f08b";

describe("School update professors roles functional tests", () => {
    beforeAll(async () => {
        server = await startServer();

        const directorSigninResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "levevre_thomas@gmail.com", password: "password123" })
            .expect(200);

        authTokenDirector = directorSigninResponse.body.token;

        const professorSigninResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "prof@gmail.com", password: "password123" })
            .expect(200);

        authTokenProfessor = professorSigninResponse.body.token;

        const signinOtherResponse = await request(server)
            .post("/api/auth/signin")
            .send({ email: "roux_vincent@gmail.com", password: "password123" })
            .expect(200);

        authOtherToken = signinOtherResponse.body.token;
    });

    afterAll(async () => {
        await server.close();
    });

    it("should successfully update professor roles", async () => {
        const professorsData = {
            schoolId: schoolId,
            professors: [
                {
                    id: professorId,
                    roles: ["professor"]
                }
            ]
        };

        const response = await request(server)
            .put(`/api/school/professors-roles`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .send(professorsData)
            .expect(200);
        expect(response.body.success).toBe("Professors roles updated successfully");
    });

    it("should return 404 if the school is not found", async () => {
        const invalidSchoolId = "6639e89369352c2f5804421e";

        const response = await request(server)
            .put(`/api/school/professors-roles`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .send({
                schoolId: invalidSchoolId,
                professors: [
                    {
                        id: professorId,
                        roles: ["professor", "director"]
                    }
                ]
            })
            .expect(404);
        expect(response.body.error).toBe("School not found");
    });

    it("should return 403 if user is not allowed to update roles", async () => {
        const response = await request(server)
            .put(`/api/school/professors-roles`)
            .set("Authorization", `Bearer ${authOtherToken}`)
            .send({
                schoolId: schoolId,
                professors: [
                    {
                        id: professorId,
                        roles: ["professor"]
                    }
                ]
            })
            .expect(403);
        expect(response.body.message).toBe("You don't have permission");
    });

    it("should return 404 if professor is not found", async () => {
        const invalidProfessorId = "6639e89369352c2f5804421e";

        const response = await request(server)
            .put(`/api/school/professors-roles`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .send({
                schoolId: schoolId,
                professors: [
                    {
                        id: invalidProfessorId,
                        roles: ["professor"]
                    }
                ]
            })
            .expect(404);
        expect(response.body.error).toBe("Professor not found");
    });

    it("should return 404 if role is not found", async () => {
        const professors = [
            {
                id: professorId,
                roles: ["sdfdsfdsfdsfdsf"]
            }
        ];

        const response = await request(server)
            .put(`/api/school/professors-roles`)
            .set("Authorization", `Bearer ${authTokenProfessor}`)
            .send({ schoolId: schoolId, professors: professors })
            .expect(404);
        expect(response.body.error).toBe("Role not found");
    });

    it('should return 403 invalide token', async () => {
        const invalideToken = "invalide token"
        const professors = [
            {
                id: professorId,
                roles: ["director"]
            }
        ];
        const response = await request(server)
            .put(`/api/school/professors-roles`)
            .set("Authorization", `Bearer ${invalideToken}`)
            .send({ schoolId, professors: professors })
            .expect(403);

        expect(response.body.message).toBe("Invalid access token");
    });
});