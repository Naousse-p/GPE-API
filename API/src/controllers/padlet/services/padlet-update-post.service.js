const { PadletPost, PadletSection } = require("../../../models");
const { getItemById, updateItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const { saveSourceFile } = require("../../../utils/multer");
const fs = require("fs");
const path = require("path");

exports.padlet_update_post_service = async (datas, postId, req) => {
  try {
    const postItemId = await validatePostId(postId);
    const post = await getPostById(postItemId);
    validatePostExistence(post);

    if (!userHasPermissionForPost(post, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    const updatedPost = await updatePost(post, datas, req);

    if (req.file) {
      await updatePostFile(updatedPost, req.file, req);
    }
    return updatedPost;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validatePostId = async (id) => {
  return isIDGood(id);
};

const getPostById = async (id) => {
  return getItemById(PadletPost, id, { path: "board", populate: { path: "class", populate: { path: "professor" } } });
};

const validatePostExistence = (post) => {
  if (!post) {
    throw { code: 404, message: "Post not found" };
  }
};

const userHasPermissionForPost = (post, userId) => {
  return post.board.class.professor.some((professor) => professor.user.toString() === userId);
};

const updatePost = async (post, datas, req) => {
  const updateData = {};

  if (datas.title !== undefined) {
    updateData.title = datas.title;
  }

  if (datas.content !== undefined) {
    updateData.content = datas.content;
  }

  if (datas.type !== undefined) {
    updateData.type = datas.type;
  }

  if (datas.sectionId !== undefined) {
    const section = await validateSectionId(datas.sectionId);
    updateData.sectionId = section;
  }

  if (datas.creator !== undefined) {
    updateData.creator = datas.creator;
  }

  if (datas.board !== undefined) {
    updateData.board = datas.board;
  }

  const updatedPost = await updateItem(PadletPost, post._id, updateData);

  return updatedPost;
};

const validateSectionId = async (id) => {
  if (!isIDGood(id)) {
    throw { code: 422, message: "Invalid section id" };
  }

  const section = await getItemById(PadletSection, id);
  if (!section) {
    throw { code: 404, message: "Section not found" };
  }

  return section;
};

const updatePostFile = async (post, file, req) => {
  // Chemin du dossier où les fichiers sont sauvegardés
  const uploadDir = path.join(__dirname, "../../../", "uploads/padlet-posts");

  // Si un fichier source existe déjà, supprimez-le
  if (post.source) {
    const existingFilePath = path.join(uploadDir, post.source);
    if (fs.existsSync(existingFilePath)) {
      fs.unlinkSync(existingFilePath); // Supprime le fichier existant
    }
  }

  // Sauvegardez le nouveau fichier
  const extension = file.originalname.split(".").pop();
  const filePath = await saveSourceFile(file.buffer, post._id, "padlet-posts", extension, false);
  post.source = filePath;
  await post.save();
};
