const { WallpostPost, WallpostComment, WallpostReaction, Class, Parent, School } = require("../../../models");
const { getItems, getItemById, getOneItem } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");

exports.wallpost_get_posts_service = async (classId, req) => {
  try {
    const classItemId = await validateClassId(classId);
    const classItem = await getItemById(Class, classItemId, "professor visitors school");
    if (!classItem) {
      throw { code: 404, message: "Classe non trouvée" };
    }

    if (!(await userHasPermissionForClass(classItem, req.userId, req.role))) {
      throw { code: 403, message: "Vous n'avez pas la permission d'accéder à cette ressource" };
    }

    const posts = await getPostsByClass(classItemId, req.role);
    const classParents = await getItems(Parent, { children: { $elemMatch: { class: classItemId } } });
    const postsWithCommentsAndReactions = await addCommentsAndReactionsToPosts(posts, classParents, req.role, req.userId);

    if (req.role.includes("parents")) {
      await markPostsAsReadForParent(posts, req.userId);
    }

    return postsWithCommentsAndReactions;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const validateClassId = async (id) => {
  return isIDGood(id);
};

const userHasPermissionForClass = async (classItem, userId, role) => {
  if (role.includes("parents")) {
    return userHasPermissionForParent(classItem, userId);
  } else if (role.includes("professor")) {
    return await userHasPermissionForProfessor(classItem, userId);
  }
};

const userHasPermissionForProfessor = async (classItem, userId) => {
  // Vérifier si l'utilisateur est un professeur de la classe
  if (classItem.professor.some((professor) => professor.user.toString() === userId)) {
    return true;
  }

  // Vérifier si l'utilisateur est un visiteur de la classe
  if (classItem.visitors.some((visitor) => visitor.user.toString() === userId)) {
    return true;
  }

  // Récupérer l'école associée à la classe
  const school = await getItemById(School, classItem.school);
  if (!school) {
    throw { code: 404, message: "School not found" };
  }

  // Vérifier si l'utilisateur est le directeur de l'école
  if (school.director && school.director.toString() === userId) {
    return true;
  }

  return false;
};

const userHasPermissionForParent = async (classItem, userId) => {
  const parent = await getOneItem(Parent, { user: userId });
  return parent.children.some((child) => child.class.toString() === classItem._id.toString());
};

const getPostsByClass = async (classItemId, role) => {
  let query = { class: classItemId };
  if (role.includes("parents")) {
    query.dateTimePublish = { $lte: new Date() };
  }
  return getItems(WallpostPost, query, "creator", { sort: { dateTimePublish: -1 } });
};
const addCommentsAndReactionsToPosts = async (posts, classParents, role, userId) => {
  const postsWithCommentsAndReactions = await Promise.all(
    posts.map(async (post) => {
      // Récupérer les commentaires et ajouter le champ 'name'
      const comments = await getItems(WallpostComment, { post: post._id }, "professor parent", "lastname firstname");
      const transformedComments = comments.map((comment) => {
        const name = comment.professor ? `${comment.professor.firstname} ${comment.professor.lastname}` : `${comment.parent.firstname} ${comment.parent.lastname}`;
        const { professor: _, ...commentWithoutProfessor } = comment.toObject(); // Supprime le champ 'professor'

        // Ajouter le champ 'mine' si l'utilisateur actuel est un parent et a créé le commentaire
        const mine = role.includes("parents") && comment.parent && comment.parent.user.toString() === userId;

        return { ...commentWithoutProfessor, name, mine };
      });

      // Récupérer les réactions et les agréger par emoji
      const reactions = await getItems(WallpostReaction, { post: post._id }, "parent", "lastname firstname");
      const reactionCounts = reactions.reduce((acc, reaction) => {
        const emoji = reaction.emoji;
        const parentName = `${reaction.parent.firstname} ${reaction.parent.lastname}`;

        if (!acc[emoji]) {
          acc[emoji] = { emoji, count: 0, parents: [] };
        }
        acc[emoji].count += 1;
        acc[emoji].parents.push(parentName);
        return acc;
      }, {});

      const aggregatedReactions = Object.values(reactionCounts).map((reaction) => {
        // Ajouter les champs 'mine' et '_id' si l'utilisateur actuel est un parent et a créé la réaction
        const mine = role.includes("parents") && reactions.some((r) => r.parent.user.toString() === userId && r.emoji === reaction.emoji);
        const reactionId = reactions.find((r) => r.parent.user.toString() === userId && r.emoji === reaction.emoji)?._id;

        return { ...reaction, mine, _id: reactionId };
      });

      // Trouver les parents n'ayant pas encore consulté le post
      const parentsWhoViewed = post.views.map((view) => view.toString());
      const parentsNotViewed = classParents.filter((parent) => !parentsWhoViewed.includes(parent._id.toString()));

      return {
        ...post.toObject(),
        comments: transformedComments,
        reactions: aggregatedReactions,
        parentsNotViewed: role.includes("professor") ? parentsNotViewed.map((parent) => `${parent.firstname} ${parent.lastname}`) : null,
      };
    })
  );

  return postsWithCommentsAndReactions;
};

const markPostsAsReadForParent = async (posts, userId) => {
  const parent = await getOneItem(Parent, { user: userId });
  if (!parent) {
    throw { code: 404, message: "Parent non trouvé" };
  }

  await Promise.all(
    posts.map(async (post) => {
      if (!post.views.includes(parent._id)) {
        post.views.push(parent._id);
        await post.save();
      }
    })
  );
};
