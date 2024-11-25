const { School, User, Professor, Role } = require("../../../models");
const { getItemById } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.school_update_professors_roles_service = async (schoolId, professors, req) => {
  try {
    const school = await getSchoolById(schoolId);
    validateSchoolExistence(school);
    validateUserAccess(school, req.userId);

    await updateProfessorsRoles(school, professors);
    return { code: 200, message: "Professors roles updated successfully" };
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

async function getSchoolById(schoolId) {
  const schoolIdGood = await isIDGood(schoolId);
  return getItemById(School, schoolIdGood, "professor director");
}

function validateSchoolExistence(school) {
  if (!school) {
    throw { code: 404, message: "School not found" };
  }
}

function validateUserAccess(school, userId) {
  if (!userCanAccessSchool(school, userId)) {
    throw { code: 403, message: "You are not allowed to access this school" };
  }
}

function userCanAccessSchool(school, userId) {
  if (school.director) {
    return school.director._id.toString() === userId;
  } else {
    return school.professor.some((prof) => prof.user.toString() === userId);
  }
}

async function updateProfessorsRoles(school, professors) {
  const professorPromises = professors.map(async (professorData) => {
    const professor = await getProfessorById(professorData.id);
    validateProfessorExistence(professor);
    validateProfessorBelongsToSchool(school, professor);
    await updateProfessorRole(professor, professorData.roles, school, professors);
  });

  await Promise.all(professorPromises);
}

async function getProfessorById(professorId) {
  const professorIdGood = await isIDGood(professorId);
  return getItemById(Professor, professorIdGood);
}

function validateProfessorExistence(professor) {
  if (!professor) {
    throw { code: 404, message: "Professor not found" };
  }
}

function validateProfessorBelongsToSchool(school, professor) {
  if (!professorBelongsToSchool(school, professor)) {
    throw { code: 403, message: "This professor does not belong to this school" };
  }
}

function professorBelongsToSchool(school, professor) {
  return school.professor.some((prof) => prof._id.toString() === professor._id.toString());
}

async function updateProfessorRole(professor, roles, school, professors) {
  await updateUserRoles(professor.user, roles, school, professors);

  const directorRoleAdded = roles.includes("director");
  if (directorRoleAdded) {
    await handleDirectorRoleAssignment(school, professor);
  }

  const treasurerRoleAdded = roles.includes("treasurer");
  if (treasurerRoleAdded) {
    school.treasurer = professor._id;
    await school.save();
  }

  await addRolesToProfessor(professor, roles);
}

async function updateUserRoles(userId, roles, school, professors) {
  const user = await User.findById(userId);
  if (!user) {
    throw { code: 404, message: "User not found" };
  }
  const rolesDb = await Role.find({ name: { $in: roles } });
  if (rolesDb.length !== roles.length) {
    throw { code: 404, message: "Role not found" };
  }

  if (roles.includes("director")) {
    const existingDirector = await School.findOne({ _id: school._id, director: { $ne: null } });

    const isSeveralDirectors = professors.filter((professorData) => professorData.roles.includes("director")).length > 1;
    if (existingDirector && isSeveralDirectors) {
      throw { code: 400, message: "A school can only have one director" };
    }
  }

  user.roles = rolesDb.map((role) => role._id);
  await user.save();
  return user;
}

async function addRolesToProfessor(professor, roles) {
  professor.role = roles;
  await professor.save();
}

async function handleDirectorRoleAssignment(school, professor) {
  if (!school.director) {
    school.director = professor.user;
    await school.save();
  } else {
    // Retirer le rôle "director" du directeur actuel
    const existingDirector = await Professor.findOneAndUpdate({ user: school.director }, { $pull: { role: "director" } }, { new: true });

    // Mettre à jour les rôles de l'utilisateur pour supprimer le rôle "director"
    const existingDirectorUser = await User.findById(existingDirector.user);
    existingDirectorUser.roles = existingDirectorUser.roles.filter((role) => role.toString() !== "director");
    await existingDirectorUser.save();

    // Mettre à jour le directeur de l'école avec le nouveau professeur
    school.director = professor.user;
    await school.save();
  }
}
