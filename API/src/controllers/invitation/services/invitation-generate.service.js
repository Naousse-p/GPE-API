const { isIDGood } = require("../../../middlewares/handler/is-uuid-good.middleware");
const RabbitMQService = require("../../../config/rabbitMqService.config");
const { getItemById, getItems } = require("../../../utils/db-generic-services.utils");
const { Student, Class } = require("../../../models");
const { generateInvitationPDF } = require("../helpers/pdfGenerator");
const archiver = require("archiver");
const fs = require("fs");
const path = require("path");

exports.invitation_generate_service = async (classId, studentIds, all, req, res) => {
  try {
    let classIdGood = await isIDGood(classId);
    const cls = await getItemById(Class, classIdGood, { path: "professor" });
    if (!cls) {
      throw { code: 404, message: "Class not found" };
    }

    let students;
    if (all) {
      students = await getItems(Student, { class: classIdGood });
    } else {
      students = await getItems(Student, { _id: { $in: studentIds } });
    }

    const tempDir = path.join(__dirname, "../../../temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const zipFilePath = path.join(tempDir, "invitations.zip");
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      console.log(`${archive.pointer()} total bytes`);
      console.log("archiver has been finalized and the output file descriptor has closed.");
    });

    archive.on("error", (err) => {
      throw err;
    });

    archive.pipe(output);

    for (const student of students) {
      const pdfBuffer = await generateInvitationPDF(student);
      const fileName = `${student.firstname}_${student.lastname}_invitation.pdf`;
      archive.append(pdfBuffer, { name: fileName });
      await RabbitMQService.publishMessage({ fileName });
    }

    await archive.finalize();

    return zipFilePath;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};
