const { WallpostPost, School, Class } = require("../../../models");
const { createItem, getItemById } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const { saveSourceFile } = require("../../../utils/multer");

exports.wallpost_create_post_service = async (datas, classId, req) => {
  try {
    const classItemId = await validateClassId(classId);
    const classItem = await getClassById(classItemId);
    validateClassExistence(classItem);

    if (!userHasPermissionForClass(classItem, req.userId)) {
      throw { code: 403, message: "Vous n'avez pas la permission d'accéder à cette ressource" };
    }

    // find the professeur of the class
    const professeur = classItem.professor.find((prof) => prof.user.toString() === req.userId);

    const post = await createPostInstance(datas, classItemId, professeur);
    const createdPost = await createItem(WallpostPost, post);

    if (req.files && req.files.length > 0) {
      const filePaths = await Promise.all(
        req.files.map(async (file, index) => {
          // Ajout de l'index
          const extension = file.originalname.split(".").pop();
          return await saveSourceFile(file.buffer, `${createdPost._id}_${index}`, "wallpost-posts", extension, true);
        })
      );
      createdPost.source = filePaths;
    }
    await createdPost.save();

    return createdPost;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateClassId = async (id) => {
  return isIDGood(id);
};

const getClassById = async (id) => {
  return getItemById(Class, id, { path: "professor" });
};

const validateClassExistence = (classItem) => {
  if (!classItem) {
    throw { code: 404, message: "Classe non trouvée" };
  }
};

const userHasPermissionForClass = async (classItem, userId) => {
  const isProfessorOfClass = classItem.professor.some((professor) => professor.user.toString() === userId);
  if (isProfessorOfClass) {
    return true;
  }

  const school = await School.findById(classItem.school).populate("professor");
  const isProfessorOfSchool = school.professor.some((professor) => professor.user.toString() === userId);

  return isProfessorOfSchool;
};
const createPostInstance = (datas, classId, professeur) => {
  return {
    title: datas.title || null,
    text: datas.text || null,
    tags: datas.tags || null,
    type: datas.type,
    class: classId,
    creator: professeur,
    dateTimePublish: datas.dateTimePublish || new Date(),
    allowComments: datas.allowComments !== undefined ? datas.allowComments : true,
  };
};
