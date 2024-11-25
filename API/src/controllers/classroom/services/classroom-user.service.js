const { Parent, User, Professor, Class, School } = require("../../../models");
const { getOneItem, getItems } = require("../../../utils/db-generic-services.utils");

exports.classroom_user_service = async (req) => {
  try {
    const user = await getOneItem(User, { _id: req.userId });
    if (!user) {
      throw { code: 404, message: "User not found" };
    }

    let schoolClasses = [];
    if (req.role.includes("parents")) {
      schoolClasses = await getClassroomsForParent(req);
    }

    if (req.role.includes("professor")) {
      schoolClasses = await getClassroomsForProfessor(req);
    }

    return schoolClasses;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

async function getClassroomsForParent(req) {
  const parent = await getOneItem(Parent, { user: req.userId }, { path: "children", populate: [{ path: "child" }, { path: "class", populate: { path: "school" } }] });
  validateParentExistence(parent);

  if (!userHasAccessToParent(parent, req.userId)) {
    throw { code: 403, message: "You are not allowed to access this parent" };
  }

  const schoolClasses = await formatDataForParent(parent);
  return schoolClasses;
}

function validateParentExistence(parent) {
  if (!parent) {
    throw { code: 404, message: "Parent not found" };
  }
}

function userHasAccessToParent(parent, user) {
  return parent.user.toString() === user;
}

async function formatDataForParent(data) {
  const schoolClassesMap = {};
  const classIds = new Set();

  for (const child of data.children) {
    const schoolId = child.class.school._id;
    const schoolName = child.class.school.name;
    const schoolCode = child.class.school.code;
    const className = child.class.name;
    const classId = child.class._id;
    const childName = child.child.firstname;
    const childId = child.child._id;

    if (!classIds.has(classId)) {
      classIds.add(classId);

      if (!schoolClassesMap[schoolId]) {
        schoolClassesMap[schoolId] = {
          schoolId,
          schoolName,
          schoolCode,
          classes: [],
        };
      }

      schoolClassesMap[schoolId].classes.push({ className, child: childName, classId, student_id: childId });
    }
  }

  const formattedData = Object.values(schoolClassesMap);

  return formattedData;
}

async function getClassroomsForProfessor(req) {
  const professor = await getOneItem(Professor, { user: req.userId });
  validateProfessorExistence(professor);

  const schools = await getItems(School, { director: professor.user });
  let classrooms = [];

  for (const school of schools) {
    const schoolClassrooms = await getItems(Class, { school: school._id }, "school");
    classrooms = classrooms.concat(schoolClassrooms);
  }

  const assignedClassrooms = await getItems(Class, { professor: professor._id }, "school");
  classrooms = classrooms.concat(assignedClassrooms);

  const visitorClassrooms = await getItems(Class, { visitors: professor._id }, "school");
  classrooms = classrooms.concat(visitorClassrooms);

  validateClassroomsExistence(classrooms);

  const schoolClasses = await formatDataForProfessor(classrooms, professor._id);
  return schoolClasses;
}

function validateProfessorExistence(professor) {
  if (!professor) {
    throw { code: 404, message: "Professor not found" };
  }
}

function validateClassroomsExistence(classrooms) {
  if (!classrooms.length) {
    throw { code: 404, message: "No classrooms found for this professor" };
  }
}

async function formatDataForProfessor(data, professorId) {
  const schoolClassesMap = {};
  const classIds = new Set();

  for (const classroom of data) {
    const schoolId = classroom.school._id;
    const schoolName = classroom.school.name;
    const schoolCode = classroom.school.code;
    const className = classroom.name;
    const classId = classroom._id;
    const yourClass = classroom.professor.some((prof) => prof.toString() === professorId.toString());
    const isVisitor = classroom.visitors.some((visitor) => visitor.toString() === professorId.toString());

    if (!classIds.has(classId.toString())) {
      classIds.add(classId.toString());

      if (!schoolClassesMap[schoolId]) {
        schoolClassesMap[schoolId] = {
          schoolId,
          schoolName,
          schoolCode,
          classes: [],
        };
      }

      schoolClassesMap[schoolId].classes.push({ className, classId, yourClass, isVisitor });
    }
  }

  // Trier les classes pour chaque école
  for (const schoolId in schoolClassesMap) {
    schoolClassesMap[schoolId].classes.sort((a, b) => b.yourClass - a.yourClass);
  }

  const formattedData = Object.values(schoolClassesMap);

  return formattedData;
}
