const request = require("supertest");
const startServer = require("../../../index");
const { School, Class } = require("../../../src/models");

let server;
let authToken;
let authToken2;
let createdSchoolId;
let createdClassId;
let createdClassId2;

describe("Classroom create functional tests", () => {
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

    });

    afterAll(async () => {
        if (createdClassId) {
            await Class.findByIdAndDelete(createdClassId);
        }

        if (createdClassId2) {
            await Class.findByIdAndDelete(createdClassId2);
        }

        if (createdSchoolId) {
            await School.findByIdAndDelete(createdSchoolId);
        }
        await server.close();
    });

    it('should create a classroom with a new school', async () => {
        const classroomData = {
            classData: {
                name: "class azer",
                level: "MS",
                code: "CLASS1234567"
            },
            schoolData: {
                schoolName: "jule",
                schoolAddress: "césar rue",
                schoolPostal_code: "75001",
                schoolCity: "Paris",
                schoolCode: "azertyui",
                schoolPhone: "0123456789",
                school_type: "new"
            }
        };

        const response = await request(server)
            .post("/api/classroom")
            .set('Authorization', `Bearer ${authToken}`)
            .send(classroomData)
            .expect(201);

        expect(response.body).toHaveProperty('_id');
        expect(response.body.name).toEqual(classroomData.classData.name);

        createdClassId = response.body._id;
        createdSchoolId = response.body.school;
    });

    it('should create classroom with a school code', async () => {
        const classroomData = {
            classData: {
                name: "classe ape test",
                code: "classeAPAE",
                level: "MS"
            },
            schoolData: {
                school_type: "exist",
                schoolId: "66ec246c4119bdd149977895",
                schoolCode: "puigddaddb"
            }
        };

        const response = await request(server)
            .post("/api/classroom")
            .set('Authorization', `Bearer ${authToken}`)
            .send(classroomData)
            .expect(201);

        expect(response.body).toHaveProperty('_id');
        expect(response.body.name).toEqual(classroomData.classData.name);

        createdClassId2 = response.body._id;
    });

    it('should return error when create a classroom with a duplicate class code', async () => {
        const classroomData = {
            classData: {
                name: "Class fail",
                level: "PS",
                code: "classe5b"
            },
            schoolData: {
                school_type: "exist",
                schoolCode: "puigddaddb"
            }
        };

        await request(server)
            .post("/api/classroom")
            .set('Authorization', `Bearer ${authToken}`)
            .send(classroomData)
            .expect(409);
    });

    it('should return error when create a classroom with a non-existent school code', async () => {
        const classroomData = {
            classData: {
                name: "Class ff",
                level: "MS",
                code: "asxf"
            },
            schoolData: {
                school_type: "exist",
                schoolCode: "azecdxzsxzcfvf"
            }
        };

        await request(server)
            .post("/api/classroom/create")
            .set('Authorization', `Bearer ${authToken}`)
            .send(classroomData)
            .expect(404);
    });

    it('should return forbidden error when professor does not have permission for the school', async () => {
        const classroomData = {
            classData: {
                name: "classe APAE",
                code: "classeAPAE",
                level: "MS",
                school: "66d97f2c12abb2fb62c89ca8",
                professor: "66d97f2c12abb2fb62c89ca4"
            },
            schoolData: {
                school_type: "exist",
                schoolCode: "jjaures"
            }
        };

        const response = await request(server)
            .post("/api/classroom")
            .set('Authorization', `Bearer ${authToken}`)
            .send(classroomData)
            .expect(403);

        expect(response.body.error).toEqual("You don't have permission to access this resource");
    });
});
