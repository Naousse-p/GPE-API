const { Class, School, Professor } = require("../../../models");
const { getOneItem, createItem, getItemById } = require("../../../utils/db-generic-services.utils");

exports.classroom_create_service = async (classData, schoolData, req) => {
  try {
    const professor = await getProfessorByUserId(req.userId);
    await validateProfessorExistence(professor);

    let school;
    if (schoolData.school_type === "exist") {
      school = await getSchoolByCode(schoolData.schoolCode);
      await validateSchoolExistence(school);
      await validateProfessorPermissionForSchool(school, professor._id);
    } else {
      validateNewSchoolCodeUnique(schoolData.code);
      school = await createSchool(schoolData);
    }

    await validateClassCodeUnique(classData.code);
    const classroom = await createClassInstance(classData, school._id, professor._id);

    if (schoolData.school_type != "exist") {
      school.professor.push(professor._id);
      await school.save();
    }

    return await saveClassroom(classroom);
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const getProfessorByUserId = async (userId) => {
  return await getOneItem(Professor, { user: userId });
};

const validateProfessorExistence = (professor) => {
  if (!professor) {
    throw { code: 404, message: "Professor not found" };
  }
};

const getSchoolByCode = async (schoolCode) => {
  return await getOneItem(School, { code: schoolCode });
};

const validateSchoolExistence = (school) => {
  if (!school) {
    throw { code: 404, message: "School not found" };
  }
};

const validateProfessorPermissionForSchool = (school, professorId) => {
  if (!school.professor.some((prof) => prof.toString() === professorId.toString())) {
    throw { code: 403, message: "You don't have permission to access this resource" };
  }
};

const validateNewSchoolCodeUnique = async (code) => {
  const existingSchool = await getOneItem(School, { code });
  if (existingSchool) {
    throw { code: 409, message: "School code already used" };
  }
};

const createSchool = async (schoolData) => {
  const newSchool = new School({
    name: schoolData.schoolName,
    address: schoolData.schoolAddress,
    postal_code: schoolData.schoolPostal_code,
    city: schoolData.schoolCity,
    code: schoolData.schoolCode,
    phone: schoolData.schoolPhone,
  });
  return await createItem(School, newSchool);
};

async function validateClassCodeUnique(code) {
  const existingClass = await getOneItem(Class, { code });
  if (existingClass) {
    throw { code: 409, message: "Class already exists" };
  }
}

const createClassInstance = (classData, schoolId, professorId) => {
  return new Class({
    name: classData.name,
    code: classData.code,
    level: classData.level,
    school: schoolId,
    professor: professorId,
  });
};

const saveClassroom = async (classroom) => {
  return await createItem(Class, classroom);
};
