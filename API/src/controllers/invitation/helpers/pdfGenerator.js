const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const { readFileSync } = require("fs");
const QRCode = require("qrcode");

class PDFGenerator {
  async generateInvitationPDF(studentData) {
    try {
      const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
      const page = await browser.newPage();

      const templatePath = "src/controllers/invitation/helpers/template.html";
      const template = await fs.readFile(templatePath, "utf8");

      const backgroundImage = getImageBase64("src/assets/invitation.png");
      const qrCodeImage = await generateQRCode(studentData.code);

      const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      const firstName = capitalize(studentData.firstname);
      const lastName = capitalize(studentData.lastname);

      const modifiedTemplate = template
        .replace("${studentData.firstname}", firstName)
        .replace("${studentData.lastname}", lastName)
        .replace("${studentData.code}", studentData.code)
        .replace("${backgroundImage}", backgroundImage)
        .replace("${qrCodeImage}", qrCodeImage);

      await page.setContent(modifiedTemplate, { waitUntil: "networkidle0" });
      const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

      await browser.close();
      return pdfBuffer;
    } catch (error) {
      throw error;
    }
  }
}

function getImageBase64(imagePath) {
  const imageData = readFileSync(imagePath);
  return `data:image/png;base64,${imageData.toString("base64")}`;
}

async function generateQRCode(text) {
  try {
    return await QRCode.toDataURL(text);
  } catch (err) {
    throw err;
  }
}

module.exports = new PDFGenerator();
