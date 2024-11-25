const { WallpostPost, Class, Parent } = require("../../../models");
const { getItemById, getOneItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const fs = require("fs");
const path = require("path");

exports.wallpost_get_file_service = async (postId, filename, req) => {
  try {
    const validPostId = await isIDGood(postId);
    const post = await getItemById(WallpostPost, validPostId);
    validatePostExistence(post);

    if (!isFileSourceValid(post, filename)) {
      throw { code: 403, message: "Fichier non autorisé" };
    }

    const classItem = await getItemById(Class, post.class, "professor");
    if (!classItem) {
      throw { code: 404, message: "Classe non trouvée" };
    }

    if (!(await userHasPermissionForPost(post, classItem, req.userId, req.role))) {
      throw { code: 403, message: "Vous n'avez pas la permission d'accéder à cette ressource" };
    }

    const filePath = getPostFilePath(filename);
    const extension = getFileType(filename);

    return { filePath, extension };
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validatePostExistence = (post) => {
  if (!post) {
    throw { code: 404, message: "Post non trouvé" };
  }
};

const getFileType = (filename) => {
  const extension = path.extname(filename).toLowerCase();

  switch (extension) {
    case ".pdf":
      return "application/pdf";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".mp3":
      return "audio/mpeg";
    case ".mp4":
      return "video/mp4";
    default:
      return "application/octet-stream"; // Fallback pour les autres types de fichiers
  }
};

const isFileSourceValid = (post, filename) => {
  return post.source && post.source.includes(filename);
};

const userHasPermissionForPost = async (post, classItem, userId, role) => {
  if (role.includes("professor")) {
    return userHasPermissionForProfessor(classItem, userId);
  } else if (role.includes("parents")) {
    return (await userHasPermissionForParent(classItem, userId)) && post.dateTimePublish <= new Date();
  }
  return false;
};

const userHasPermissionForProfessor = (classItem, userId) => {
  return classItem.professor.some((professor) => professor.user.toString() === userId);
};

const userHasPermissionForParent = async (classItem, userId) => {
  const parent = await getOneItem(Parent, { user: userId });
  return parent.children.some((child) => child.class.toString() === classItem._id.toString());
};

const getPostFilePath = (filename) => {
  const uploadDir = path.join(__dirname, "../../../..", "uploads/wallpost-posts");
  const filePath = path.join(uploadDir, filename);

  if (!fs.existsSync(filePath)) {
    throw { code: 404, message: "Fichier non trouvé" };
  }
  return filePath;
};
