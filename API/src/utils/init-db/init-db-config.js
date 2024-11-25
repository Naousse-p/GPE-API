const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const insertData = async (model, data) => {
  try {
    await model.create(data);
    console.log(`Inserted data into ${model.modelName} collection`);
  } catch (error) {
    console.log(`Error inserting data into ${model.modelName} collection: `, error);
  }
};

const removeOIDOccurrences = (data) => {
  const jsonString = JSON.stringify(data);
  const cleanedString = jsonString.replace(/{"\$oid"\s*:\s*"([^"]+)"\s*}/g, '"$1"');
  const cleanedData = JSON.parse(cleanedString);
  return cleanedData;
};

const transformDateOccurrences = (data) => {
  const jsonString = JSON.stringify(data);
  const transformedString = jsonString.replace(/{"\$date"\s*:\s*"([^"]+)"}/g, '"$1"');
  const transformedData = JSON.parse(transformedString);
  return transformedData;
};

const initBucketData = async (bucketsData) => {
  try {
    const conn = mongoose.connection;

    for (let i = 0; i < bucketsData.length; i++) {
      const { bucket, chunksPath, filesPath } = bucketsData[i];

      const filesData = transformDateOccurrences(removeOIDOccurrences(require(filesPath)));
      const chunksData = transformDateOccurrences(removeOIDOccurrences(require(chunksPath)));
      filesData.forEach((file) => (file._id = ObjectId(file._id)));
      chunksData.forEach((chunk) => {
        chunk.files_id = ObjectId(chunk.files_id);
        chunk.data = Buffer.from(chunk.data.$binary.base64, "base64");
        delete chunk.data.$binary;
      });
      chunksData.forEach((chunk) => (chunk._id = ObjectId(chunk._id)));

      const filesCount = await conn.db.collection(`${bucket}.files`).countDocuments({});
      const chunksCount = await conn.db.collection(`${bucket}.chunks`).countDocuments({});

      if (filesCount === 0 && chunksCount === 0) {
        await conn.db.collection(`${bucket}.files`).insertMany(filesData);
        await conn.db.collection(`${bucket}.chunks`).insertMany(chunksData);
        console.log(`Inserted data into ${bucket}.files and ${bucket}.chunks collections`);
      }
    }
  } catch (error) {
    console.log("Error initializing bucket data: ", error);
  }
};

const initData = async () => {
  try {
    const conn = mongoose.connection;

    const data = [
      { model: conn.model("AcquiredSticker"), data: require("./json/acquiredstickers.json"), collection: "acquiredstickers" },
      { model: conn.model("Appreciation"), data: require("./json/appreciations.json"), collection: "appreciations" },
      { model: conn.model("Conversation"), data: require("./json/conversations.json"), collection: "conversations" },
      { model: conn.model("Event"), data: require("./json/events.json"), collection: "events" },
      { model: conn.model("Message"), data: require("./json/messages.json"), collection: "messages" },
      { model: conn.model("PadletBoard"), data: require("./json/padletboards.json"), collection: "padletboards" },
      { model: conn.model("PadletPost"), data: require("./json/padletposts.json"), collection: "padletposts" },
      { model: conn.model("PadletSection"), data: require("./json/padletsections.json"), collection: "padletsections" },
      { model: conn.model("TreasuryClassroom"), data: require("./json/treasuryclassrooms.json"), collection: "treasuryclassrooms" },
      { model: conn.model("TreasurySchool"), data: require("./json/treasuryschools.json"), collection: "treasuryschools" },
      { model: conn.model("TreasuryTransaction"), data: require("./json/treasurytransactions.json"), collection: "treasurytransactions" },
      { model: conn.model("WallpostComment"), data: require("./json/wallpostcomments.json"), collection: "wallpostcomments" },
      { model: conn.model("WallpostPost"), data: require("./json/wallpostposts.json"), collection: "wallpostposts" },
      { model: conn.model("WallpostReaction"), data: require("./json/wallpostreactions.json"), collection: "wallpostreactions" },
      { model: conn.model("User"), data: require("./json/users.json"), collection: "users" },
      { model: conn.model("Student"), data: require("./json/students.json"), collection: "students" },
      { model: conn.model("Sticker"), data: require("./json/stickers.json"), collection: "stickers" },
      { model: conn.model("School"), data: require("./json/schools.json"), collection: "schools" },
      { model: conn.model("Role"), data: require("./json/roles.json"), collection: "roles" },
      { model: conn.model("Professor"), data: require("./json/professors.json"), collection: "professors" },
      { model: conn.model("Parent"), data: require("./json/parents.json"), collection: "parents" },
      { model: conn.model("Class"), data: require("./json/classes.json"), collection: "classes" },
    ];

    for (const d of data) {
      const count = await conn.db.collection(d.collection).countDocuments({});
      if (count === 0) {
        const cleanedData = transformDateOccurrences(removeOIDOccurrences(d.data));

        // Ajoutez la logique de conversion pour le champ "photo"
        cleanedData.forEach((data) => {
          if (data.photo && data.photo.$binary && data.photo.$binary.base64) {
            data.photo = Buffer.from(data.photo.$binary.base64, "base64");
            delete data.photo.$binary;
          }
          if (data.source && data.source.$binary && data.source.$binary.base64) {
            data.source = Buffer.from(data.source.$binary.base64, "base64");
            delete data.source.$binary;
          }
        });

        await insertData(d.model, cleanedData);
      }
    }
  } catch (error) {
    console.log("Error initializing data: ", error);
  }
};

module.exports = initData;
