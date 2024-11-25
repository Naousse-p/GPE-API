const request = require("supertest");
const startServer = require("../../../index");
let server;
let authToken;
let authToken2;
let appreciationId;
const studentId = "66eeea6cc983d2cbd60d603b";

describe("Appreciation update functional tests", () => {
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

        const AppreciationData = {
            appreciations: [
                {
                    content: "Participation active aux activités de groupe de la classe.",
                    date: "2024-03-20",
                    section: "ps"
                }
            ]
        };
        const createResponse = await request(server)
            .post(`/api/appreciation/${studentId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(AppreciationData)
            .expect(201);
        appreciationId = createResponse.body[0]._id;
    });

    afterAll(async () => {
        await request(server)
            .delete(`/api/appreciation/${appreciationId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);

        await server.close();
    });

    it('should update appreciation for student successfully', async () => {
        const updatedAppreciationData = {
            content: "L'élève a montré une amélioration continue en francais !!",
            date: "2023-11-01",
            section: "ps"
        };
        console.log(appreciationId)
        const updateResponse = await request(server)
            .put(`/api/appreciation/${appreciationId}/student/${studentId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(updatedAppreciationData)
            .expect(200);
        expect(updateResponse.body).toHaveProperty('_id', appreciationId);
    });

    it('should return error for appreciation id not found', async () => {
        const noExistentAppreciationId = "6639f038ef8b493f38e27f1e";

        const updatedAppreciationData = {
            content: "L'élève a montré une amélioration continue en mathématiques.",
            date: "2023-11-01",
            section: "ps"
        };

        const response = await request(server)
            .put(`/api/appreciation/${noExistentAppreciationId}/student/${studentId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(updatedAppreciationData)
            .expect(404);

        expect(response.body.error).toEqual('Appreciation not found');
    });

    it('should return error for student id not found', async () => {
        const nonExistentStudentId = "6639f038ef8b493f38e27f1e";

        const updatedAppreciationData = {
            content: "L'élève a montré une amélioration continue en mathématiques.",
            date: "2023-11-01",
            section: "ps"
        };

        const response = await request(server)
            .put(`/api/appreciation/${appreciationId}/student/${nonExistentStudentId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send(updatedAppreciationData)
            .expect(404);

        expect(response.body.error).toEqual('Student not found');
    });

    it('should return forbidden error when user does not have access to the student', async () => {
        const updatedAppreciationData = {
            appreciationData: {
                content: "L'élève a montré une amélioration continue en francais !!",
                date: "2023-11-01",
                section: "ps"
            }
        };

        const response = await request(server)
            .put(`/api/appreciation/${appreciationId}/student/${studentId}`)
            .set('Authorization', `Bearer ${authToken2}`)
            .send(updatedAppreciationData)
            .expect(403);

        expect(response.body.error).toEqual("You don't have permission to access this resource");
    });

    it('should return unauthorized error when no token provided', async () => {
        const updatedAppreciationData = {
            content: "L'élève a montré une amélioration continue en mathématiques.",
            date: "2023-11-01",
            section: "ps"
        };

        const response = await request(server)
            .put(`/api/appreciation/${appreciationId}/student/${studentId}`)
            .send(updatedAppreciationData)
            .expect(401);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toEqual('Access token not provided');
    });
});