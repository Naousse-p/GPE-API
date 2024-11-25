const { Appreciation, Student } = require("../../../models");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const { getItemById, updateItem } = require("../../../utils/db-generic-services.utils");

exports.appreciation_publish_service = async (studentId, appreciationIds, userId) => {
  try {
    // Valider l'ID de l'élève
    const validatedStudentId = await validateStudentId(studentId);

    // Récupérer l'élève par son ID
    const student = await getStudentById(validatedStudentId);
    validateStudentExistence(student);

    // Vérifier que l'enseignant a accès à cet élève
    if (!userHasAccessToStudent(userId, student)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    // Valider les IDs des appréciations
    const validatedAppreciationIds = await Promise.all(appreciationIds.map(validateAppreciationId));

    // Récupérer et mettre à jour chaque appréciation
    const updatedAppreciations = await Promise.all(
      validatedAppreciationIds.map(async (appreciationId) => {
        const appreciation = await getAppreciationById(appreciationId);
        validateAppreciationExistence(appreciation);

        // Vérifier que l'appréciation appartient à l'élève
        if (appreciation.student.toString() !== studentId) {
          throw { code: 400, message: `Appreciation with ID ${appreciationId} does not belong to the specified student` };
        }

        // Mettre à jour le champ `published` de l'appréciation à `true`
        appreciation.published = true;

        // Sauvegarder l'appréciation mise à jour dans la base de données
        return saveUpdatedAppreciationToDatabase(appreciation);
      })
    );

    // Retourner les appréciations mises à jour
    return updatedAppreciations;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateStudentId = async (id) => {
  return isIDGood(id);
};

const getStudentById = async (id) => {
  return Student.findById(id)
    .populate({
      path: "class",
      populate: {
        path: "professor",
        model: "Professor",
      },
    })
    .exec();
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
