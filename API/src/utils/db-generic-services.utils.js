const { buildErrObject } = require("../middlewares/handler/error.middleware");

const createItem = (model, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const item = await model.create(data);
      resolve(item);
    } catch (err) {
      console.error("Erreur dans createItem :", err);
      reject(buildErrObject(422, err.message));
    }
  });
};

const createItemWithSession = (model, data, session) => {
  return new Promise(async (resolve, reject) => {
    try {
      const item = new model(data);
      await item.save({ session });
      resolve(item);
    } catch (err) {
      console.error("Erreur dans createItemWithSession :", err);
      reject(buildErrObject(422, err.message));
    }
  });
};

const getItemById = (model, itemId, populateOptions = "") => {
  return new Promise(async (resolve, reject) => {
    try {
      let query = model.findById(itemId);
      if (populateOptions) {
        query = query.populate(populateOptions);
      }
      const item = await query.exec();
      resolve(item);
    } catch (err) {
      console.error("Erreur dans getItemById :", err);
      reject(buildErrObject(422, err.message));
    }
  });
};

const getOneItem = (model, query, populateOptions = "") => {
  return new Promise(async (resolve, reject) => {
    try {
      let document = model.findOne(query);
      if (populateOptions) {
        document = document.populate(populateOptions);
      }
      const item = await document.exec();
      resolve(item);
    } catch (err) {
      console.error("Erreur dans getOneItem :", err);
      reject(buildErrObject(422, err.message));
    }
  });
};

const getItems = (model, query, populateOptions = "", options = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      let document = model.find(query);
      if (populateOptions) {
        document = document.populate(populateOptions);
      }
      if (options.sort) {
        document = document.sort(options.sort);
      }
      const item = await document.exec();
      resolve(item);
    } catch (err) {
      console.error("Erreur dans getItems :", err);
      reject(buildErrObject(422, err.message));
    }
  });
};

const updateItem = async (model, itemId, updateData) => {
  try {
    const item = await model.findByIdAndUpdate(itemId, updateData, { new: true });
    return item;
  } catch (err) {
    console.error("Erreur dans updateItem :", err);
    throw buildErrObject(422, err.message);
  }
};

const updateItems = async (model, query, updateData) => {
  try {
    const items = await model.updateMany(query, updateData, { new: true });
    return items;
  } catch (err) {
    console.error("Erreur dans updateItems :", err);
    throw buildErrObject(422, err.message);
  }
};

const deleteItem = async (model, itemId) => {
  try {
    const item = await model.findByIdAndDelete(itemId);
    return item;
  } catch (err) {
    console.error("Erreur dans deleteItem :", err);
    throw buildErrObject(422, err.message);
  }
};

const deleteItems = async (model, query) => {
  try {
    const items = await model.deleteMany(query);
    return items;
  } catch (err) {
    console.error("Erreur dans deleteItems :", err);
    throw buildErrObject(422, err.message);
  }
};

module.exports = {
  createItem,
  getItemById,
  getOneItem,
  getItems,
  updateItem,
  deleteItem,
  createItemWithSession,
  updateItems,
  deleteItems,
};
