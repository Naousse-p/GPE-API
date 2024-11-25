// appreciation-update.service.js
const { Appreciation, Student, Professor } = require("../../../models");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const { getItemById, updateItem } = require("../../../utils/db-generic-services.utils");

exports.appreciation_update_service = async (studentId, appreciationId, appreciationData, req) => {
  try {
    // Valider l'ID de l'élève
    const validatedStudentId = await validateStudentId(studentId);

    // Récupérer l'élève par son ID
    const student = await getStudentById(validatedStudentId);
    validateStudentExistence(student);

    // Vérifier que l'enseignant a accès à cet élève
    if (!(await userHasAccessToStudent(req.userId, student))) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    // Valider l'ID de l'appréciation
    const validatedAppreciationId = await validateAppreciationId(appreciationId);

    // Récupérer l'appréciation par son ID
    const appreciation = await getAppreciationById(validatedAppreciationId);
    validateAppreciationExistence(appreciation);

    // Vérifier que l'appréciation appartient à l'élève
    if (appreciation.student.toString() !== studentId) {
      throw { code: 400, message: "This appreciation does not belong to the specified student" };
    }

    // Mettre à jour les champs de l'appréciation avec les nouvelles données
    Object.assign(appreciation, appreciationData);

    // Vérifier que le champ content est bien mis à jour
    if (appreciation.content !== appreciationData.content) {
      throw { code: 500, message: "Failed to update content" };
    }

    // Sauvegarder l'appréciation mise à jour dans la base de données
    const updatedAppreciation = await saveUpdatedAppreciationToDatabase(appreciation);

    // Retourner l'appréciation mise à jour
    return updatedAppreciation;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateStudentId = async (id) => {
  return isIDGood(id);
};

const getStudentById = async (id) => {
  return getItemById(Student, id, "class");
};

const validateStudentExistence = (student) => {
  if (!student) {
    throw { code: 404, message: "Student not found" };
  }
};

const userHasAccessToStudent = async (userId, student) => {
  for (const professorId of student.class.professor) {
    let professorIdGood = await isIDGood(professorId.toString());
    const professor = await getItemById(Professor, professorIdGood);

    if (professor.user.toString() === userId) {
      return true;
    } else {
      return false;
    }
  }
  return false;
};

const validateAppreciationId = async (id) => {
  return isIDGood(id);
};

const getAppreciationById = async (id) => {
  return getItemById(Appreciation, id);
};

const validateAppreciationExistence = (appreciation) => {
  if (!appreciation) {
    throw { code: 404, message: "Appreciation not found" };
  }
};

const saveUpdatedAppreciationToDatabase = async (appreciation) => {
  return updateItem(Appreciation, appreciation._id, appreciation);
};
