const { Student, AcquiredSticker } = require("../../../models/");
const { generatePDF } = require("../helpers/pdfGenerator");
const { getItemById } = require("../../../utils/db-generic-services.utils");
const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const RabbitMQService = require("../../../config/rabbitMqService.config");
const fs = require("fs");
const path = require("path");

exports.sticker_book_generate_service = async (studentId, req, res) => {
  try {
    let student = await isIDGood(studentId);
    student = await getItemById(Student, student, { path: "class", populate: { path: "professor" } });
    if (!student) {
      throw { code: 404, message: "Student not found" };
    }

    const query = { student: studentId };
    if (req.role.includes("parents")) {
      query["isPublished"] = true;
    }

    const acquiredStickers = await AcquiredSticker.find(query).populate("sticker");
    const pdf = await generatePDF(student, acquiredStickers, displayStickerImage, req);
    await RabbitMQService.publishMessage({ fileName: `${student.firstname}_${student.lastname}.pdf` });

    return pdf;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

// Convert sticker image to base64 format
const displayStickerImage = (stickerId, res) => {
  const filepath = getStickerFilePath(stickerId);
  const buffer = fs.readFileSync(filepath);
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
};

// Get the file path of the sticker image
function getStickerFilePath(stickerId) {
  const uploadDir = path.join(__dirname, "../../../..", "uploads/sticker");
  const fileName = `${stickerId}_source.jpg`;
  const filePath = path.join(uploadDir, fileName);

  if (!fs.existsSync(filePath)) {
    throw { code: 404, message: "Sticker not found" };
  }

  return filePath;
}
