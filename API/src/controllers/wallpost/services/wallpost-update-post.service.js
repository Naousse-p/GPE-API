const { WallpostPost } = require("../../../models");
const { getItemById } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const { saveSourceFile } = require("../../../utils/multer");
const fs = require("fs");
const path = require("path");

exports.wallpost_update_post_service = async (postId, datas, req) => {
  try {
    const postItemId = await validatePostId(postId);
    const postItem = await getItemById(WallpostPost, postItemId, { path: "class", populate: { path: "professor" } });
    if (!postItem) {
      throw { code: 404, message: "Post not found" };
    }

    if (!userHasPermissionForPost(postItem, req.userId)) {
      throw { code: 403, message: "You don't have permission to access this resource" };
    }

    // Update fields
    postItem.title = datas.title || postItem.title;
    postItem.text = datas.text || postItem.text;
    postItem.allowComments = datas.allowComments !== undefined ? datas.allowComments : postItem.allowComments;
    postItem.dateTimePublish = datas.dateTimePublish || postItem.dateTimePublish;
    postItem.tags = datas.tags || postItem.tags;

    if (datas.filesToRemove) {
      const filesToRemove = Array.isArray(datas.filesToRemove) ? datas.filesToRemove : JSON.parse(datas.filesToRemove);

      if (filesToRemove.length > 0) {
        filesToRemove.forEach((file) => {
          const filePath = getPostFilePath(postItemId, file);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          postItem.source = postItem.source.filter((src) => src !== file);
        });
      }
    }
    if (req.files && req.files.length > 0) {
      const filePaths = await Promise.all(
        req.files.map(async (file, index) => {
          const extension = file.originalname.split(".").pop();
          return await saveSourceFile(file.buffer, `${postItemId}_${index}`, "wallpost-posts", extension, true);
        })
      );
      postItem.source = [...postItem.source, ...filePaths];
    }

    await postItem.save();
    return postItem;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validatePostId = async (id) => {
  return isIDGood(id);
};

function userHasPermissionForPost(postItem, userId) {
  return postItem.class.professor.some((professor) => professor.user.toString() === userId);
}

function getPostFilePath(postId, file) {
  const uploadDir = path.join(__dirname, "../../../..", "uploads/wallpost-posts");

  return path.join(uploadDir, file);
}
