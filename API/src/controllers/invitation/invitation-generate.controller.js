const { invitation_generate_service } = require("./services");
const fs = require("fs");

exports.invitation_generate = async (req, res) => {
  try {
    const { classId, studentIds, all } = req.query;
    const zipFilePath = await invitation_generate_service(classId, studentIds ? studentIds.split(",") : [], all === "true", req, res);

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename=invitations.zip`);

    const readStream = fs.createReadStream(zipFilePath);
    readStream.pipe(res);

    readStream.on("end", () => {
      fs.unlinkSync(zipFilePath); // Supprimez le fichier temporaire après l'envoi
    });
  } catch (error) {
    if (error.code === 422) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(error.code || 500).json({ error: error.message || "Internal server error" });
    }
  }
};

// const { invitation_generate_service } = require("./services");
// exports.invitation_generate = async (req, res) => {
//   try {
//     const { classId, studentIds, all } = req.body;
//     const pdfBuffers = await invitation_generate_service(classId, studentIds, all, req, res);

//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Disposition", `attachment; filename=invitation.pdf`);
//     res.send(Buffer.concat(pdfBuffers));
//   } catch (error) {
//     res.status(error.code || 500).send({ message: error.message });
//   }
// };
