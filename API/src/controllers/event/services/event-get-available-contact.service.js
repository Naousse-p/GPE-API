const { Class, Professor, Parent, School } = require("../../../models");
const { getItemById, getItems, getOneItem } = require("../../../utils/db-generic-services.utils");

exports.event_get_available_contact_service = async (req, classId) => {
  try {
    let contacts = {};

    if (req.role.includes("professor")) {
      contacts.parents = await getParentOfTheClass(classId);
      contacts.professors = await getProfessorsOfSchool(classId, req.userId);
    } else if (req.role.includes("parents")) {
      contacts.teachers = await getTeachersOfClass(classId);
      contacts.director = await getDirectorOfSchool(classId);
    } else {
      throw { code: 403, message: "Rôle utilisateur non autorisé" };
    }

    return contacts;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const getParentOfTheClass = async (classId) => {
  const parents = await getItems(Parent, { children: { $elemMatch: { class: classId } } });
  return parents.map((parent) => ({
    _id: parent._id,
    name: `${parent.firstname} ${parent.lastname}`,
  }));
};

const getProfessorsOfSchool = async (classId, currentProfessorId) => {
  const classItem = await getItemById(Class, classId, "school");
  const school = await getItemById(School, classItem.school, "professor");
  const professors = await getItems(Professor, { _id: { $in: school.professor } }, "firstname lastname");
  return professors
    .filter((professor) => professor.user.toString() !== currentProfessorId)
    .map((professor) => ({
      _id: professor._id,
      name: `${professor.firstname} ${professor.lastname}`,
      role: professor.role,
    }));
};

const getTeachersOfClass = async (classId) => {
  const classItem = await getItemById(Class, classId, "professor");
  const professor = await getItems(Professor, { _id: { $in: classItem.professor } }, "firstname lastname");
  return professor.map((prof) => ({
    _id: prof._id,
    name: `${prof.firstname} ${prof.lastname}`,
  }));
};

const getDirectorOfSchool = async (classId) => {
  const classItem = await getItemById(Class, classId, "school");
  const { director } = await getItemById(School, classItem.school, "director");
  const teacher = await getOneItem(Professor, { user: director._id });
  return { name: `${teacher.firstname} ${teacher.lastname}`, _id: teacher._id };
};
