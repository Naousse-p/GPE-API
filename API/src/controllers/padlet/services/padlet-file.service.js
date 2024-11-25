const { PadletPost, Parent, Class } = require("../../../models");
const { getItemById, getOneItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

const fs = require("fs");
const path = require("path");

exports.padlet_file_service = async (id, req) => {
  try {
    let postId = await isIDGood(id);
    const post = await getItemById(PadletPost, postId, { path: "board", populate: { path: "class", populate: { path: "professor" } } });
    validatePostExistence(post);

    if (!(await userHasPermissionForPost(post, req.userId, req.role))) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    const { filePath, extension } = getPostFilePath(post);
    return { filePath, extension };
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

function validatePostExistence(post) {
  if (!post) {
    throw { code: 404, message: "Post not found" };
  }
}

async function userHasPermissionForPost(post, userId, role) {
  if (await userHasPermissionForClass(post.board.class, userId, role)) {
    return true;
  }

  // Vérifier si l'utilisateur est professeur de l'une des classes partagées
  const sharedClasses = await Class.find({ _id: { $in: post.board.sharedWithClasses } }).populate("professor");
  const isProfessorOfSharedClass = sharedClasses.some((sharedClass) => sharedClass.professor.some((professor) => professor.user.toString() === userId));

  return isProfessorOfSharedClass;
}

async function userHasPermissionForClass(classItem, userId, role) {
  if (role.includes("parents")) {
    return userHasPermissionForParent(classItem, userId);
  } else if (role.includes("professor")) {
    return userHasPermissionForProfessor(classItem, userId);
  }
}

function userHasPermissionForProfessor(classItem, userId) {
  return classItem.professor.some((professor) => professor.user.toString() === userId);
}

async function userHasPermissionForParent(classItem, userId) {
  const parent = await getOneItem(Parent, { user: userId });
  return parent.children.some((child) => child.class.toString() === classItem._id.toString());
}

function getPostFilePath(post) {
  const uploadDir = path.join(__dirname, "../../../..", "uploads/padlet-posts");
  const fileName = `${post.source}`;

  const extension = path.extname(fileName).toLowerCase(); // Obtenir l'extension du fichier
  const filePath = path.join(uploadDir, fileName);
  if (!fs.existsSync(filePath)) {
    throw { code: 404, message: "File not found" };
  }

  return { filePath, extension };
}

function getFileType(filename) {
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
      return "application/octet-stream";
  }
}
