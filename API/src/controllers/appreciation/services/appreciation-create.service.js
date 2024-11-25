// appreciation-create.service.js
const { Appreciation, Student, Professor } = require("../../../models");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const { getItemById, createItem, getOneItem } = require("../../../utils/db-generic-services.utils");

exports.appreciation_create_service = async (studentId, appreciationsData, req) => {
  try {
    // Valider l'ID de l'élève
    const validatedStudentId = await validateStudentId(studentId);

    // Récupérer l'élève par son ID
    const student = await getStudentById(validatedStudentId);
    validateStudentExistence(student);

    // Vérifier que l'enseignant a accès à cet élève
    if (!userHasAccessToStudent(req.userId, student)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    // Récupérer les appréciations existantes pour l'année scolaire en cours
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const schoolYearStart = currentDate.getMonth() >= 8 ? currentYear : currentYear - 1;
    const schoolYearEnd = schoolYearStart + 1;

    const existingAppreciations = await Appreciation.find({
      student: studentId,
      date: {
        $gte: new Date(schoolYearStart, 8, 1), // 1er septembre de l'année scolaire en cours
        $lt: new Date(schoolYearEnd, 7, 31), // 31 juillet de l'année scolaire suivante
      },
    });

    // Vérifier si le nombre total d'appréciations dépasse trois
    if (existingAppreciations.length + appreciationsData?.appreciations.length > 3) {
      throw { code: 400, message: "Cannot create more than three appreciations for the same school year" };
    }

    const professor = await getOneItem(Professor, { user: req.userId });

    // Créer les instances d'appréciation
    const createdAppreciations = [];
    for (const appreciationData of appreciationsData?.appreciations) {
      const appreciation = createAppreciationInstance(appreciationData, studentId, professor._id, student.class._id, student);
      const createdAppreciation = await saveAppreciationToDatabase(appreciation);
      createdAppreciations.push(createdAppreciation);
    }

    // Retourner les appréciations créées
    return createdAppreciations;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateStudentId = async (id) => {
  return isIDGood(id);
};

const getStudentById = async (id) => {
  return getItemById(Student, id, { path: "class", populate: { path: "professor" } });
};

const validateStudentExistence = (student) => {
  if (!student) {
    throw { code: 404, message: "Student not found" };
  }
};

const userHasAccessToStudent = (userId, student) => {
  for (const professor of student.class.professor) {
    if (professor.user.toString() === userId) {
      return true;
    }
  }
  return false;
};

const createAppreciationInstance = (appreciationData, studentId, professorId, classroom, student) => {
  return new Appreciation({
    student: studentId,
    professor: professorId,
    content: appreciationData.content,
    date: Date.now(),
    section: student.level,
    classroom: classroom,
  });
};

const saveAppreciationToDatabase = async (appreciation) => {
  return createItem(Appreciation, appreciation);
};
