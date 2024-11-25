const { Class } = require("../../../models");
const { getItemById, updateItem } = require("../../../utils/db-generic-services.utils");

exports.classroom_update_service = async (id, data, req) => {
  try {
    const classroom = await getItemById(Class, id, "professor visitors");
    validateClassroomExistence(classroom);

    if (!userHasAccessToClassroom(classroom, req.userId)) {
      throw { code: 403, message: "You are not allowed to access this classroom" };
    }

    const updateData = prepareUpdateData(data);
    const updatedClassroom = await updateClassroom(id, updateData);

    return updatedClassroom;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

function validateClassroomExistence(classroom) {
  if (!classroom) {
    throw { code: 404, message: "Classroom not found" };
  }
}

function userHasAccessToClassroom(classroom, user) {
  return classroom.professor.some((professor) => professor.user.toString() === user);
}

function prepareUpdateData(data) {
  const { name, professor, level, visitors } = data;
  const updateData = {};
  if (name) updateData.name = name;
  if (professor) updateData.professor = professor;
  if (level) updateData.level = level;
  if (visitors) updateData.visitors = visitors;
  if (Object.keys(updateData).length === 0) {
    throw { code: 422, message: "No data to update" };
  }
  return updateData;
}

async function updateClassroom(id, data) {
  return await updateItem(Class, { _id: id }, { $set: data });
}
