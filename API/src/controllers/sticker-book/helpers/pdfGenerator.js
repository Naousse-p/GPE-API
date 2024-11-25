const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const { readFileSync } = require("fs");
const { Appreciation } = require("../../../models/");

// Group stickers by two-month periods
function groupStickersByTwoMonths(acquiredStickers) {
  acquiredStickers.sort((a, b) => new Date(a.dateAcquired) - new Date(b.dateAcquired));

  const groups = {};

  acquiredStickers.forEach((sticker) => {
    const date = new Date(sticker.dateAcquired);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const twoMonthPeriod = Math.ceil(month / 2);
    const periodKey = `${year}-${twoMonthPeriod}`;

    if (!groups[periodKey]) {
      groups[periodKey] = [];
    }

    groups[periodKey].push(sticker);
  });

  return groups;
}

// Convert image to base64 format
function getImageBase64(imagePath) {
  const imageData = readFileSync(imagePath);
  return `data:image/png;base64,${imageData.toString("base64")}`;
}

// Replace placeholders in the template with actual data
function replaceTemplatePlaceholders(template, studentData, grille3By4, imagesBase64) {
  let modifiedTemplate = template
    .replace("${studentData.firstname}", studentData.firstname)
    .replace("${studentData.lastname}", studentData.lastname)
    .replace("${coverImage}", imagesBase64.coverImage)
    .replace("${premierOutilCover}", imagesBase64.premierOutilCover)
    .replace("${activiteArtistiqueCover}", imagesBase64.activiteArtistiqueCover)
    .replace("${agirExprimerCover}", imagesBase64.agirExprimerCover)
    .replace("${apprendreEnsembleCover}", imagesBase64.apprendreEnsembleCover)
    .replace("${explorerLeMondeCover}", imagesBase64.explorerLeMondeCover)
    .replace("${MobiliserLangageCover}", imagesBase64.MobiliserLangageCover);

  if (grille3By4.trim()) {
    modifiedTemplate = modifiedTemplate.replace("${grille3By4}", grille3By4);
  } else {
    modifiedTemplate = modifiedTemplate.replace("${grille3By4}", "");
  }

  return modifiedTemplate;
}

// Generate HTML for the appreciation page
function generateAppreciationPageHTML(level, appreciationContent, appreciationDate) {
  const formattedDate = new Date(appreciationDate).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <div class="page ">
      <div class="m appreciation-page">
        <div class="appreciation-title">Appréciation pour le niveau ${level.toUpperCase()}</div>
        <div class="appreciation-card">
          <div class="appreciation-date">${formattedDate}</div>
          <p>${appreciationContent}</p>
        </div>
      </div>
    </div>`;
}

// Generate HTML for the sticker grid
function generateGridHTML(groups, displayStickerImage, appreciations) {
  const stickersWithPeriods = [];

  Object.keys(groups).forEach((periodKey) => {
    const stickers = groups[periodKey];
    stickers.forEach((sticker) => {
      stickersWithPeriods.push({ sticker, periodKey });
    });
  });

  let currentPeriod = "";
  let currentLevel = stickersWithPeriods.length ? stickersWithPeriods[0].sticker.level : "";
  let html = '<div class="page"><div class="m"><div class="grid-container-12">';
  let stickerCount = 0;

  stickersWithPeriods.forEach((item, index) => {
    const { sticker, periodKey } = item;
    const [year, twoMonthPeriod] = periodKey.split("-");
    const startMonth = (twoMonthPeriod - 1) * 2 + 1;
    const endMonth = startMonth + 1;
    const startDate = new Date(year, startMonth - 1);
    const endDate = new Date(year, endMonth - 1);
    const periodName = `${startDate.toLocaleString("fr-FR", { month: "long" })} - ${endDate.toLocaleString("fr-FR", { month: "long" })} ${year}`;

    if (currentPeriod !== periodKey && stickerCount >= 7) {
      html += `</div></div></div><div class="page"><div class="m"><div class="grid-container-12">`;
      stickerCount = 0;
    }

    if (sticker.level !== currentLevel) {
      const appreciationContent = appreciations[currentLevel]?.content || "Pas d'appréciation disponible pour ce niveau.";
      const appreciationDate = appreciations[currentLevel]?.date || "Date inconnue";
      html += generateAppreciationPageHTML(currentLevel, appreciationContent, appreciationDate);

      currentLevel = sticker.level;
      html += `<div class="page"><div class="m"><div class="grid-container-12">`;
      stickerCount = 0;
    }

    if (currentPeriod !== periodKey) {
      currentPeriod = periodKey;
      html += `<div class="month-label">${periodName}</div>`;
    }

    html += `
      <div class="grid-item">
        <img src="${displayStickerImage(sticker.sticker._id)}" alt="Sticker Image" />
      </div>`;

    stickerCount++;

    if (stickerCount === 9 && index !== stickersWithPeriods.length - 1) {
      html += `</div></div></div><div class="page"><div class="m"><div class="grid-container-12">`;
      stickerCount = 0;
    }
  });

  if (stickersWithPeriods.length > 0) {
    const appreciationContent = appreciations[currentLevel]?.content || "Pas d'appréciation disponible pour ce niveau.";
    const appreciationDate = appreciations[currentLevel]?.date || "Date inconnue";
    html += "</div></div></div>";
    html += generateAppreciationPageHTML(currentLevel, appreciationContent, appreciationDate);
  }

  return html;
}

class PDFGenerator {
  async generatePDF(studentData, acquiredStickers, displayStickerImage, req) {
    try {
      const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
      const page = await browser.newPage();
      const groupedStickers = groupStickersByTwoMonths(acquiredStickers);

      // Query the appreciations from the database for the student
      const appreciations = {};
      const appreciationDocs = await Appreciation.find({ student: studentData._id });
      appreciationDocs.forEach((doc) => {
        appreciations[doc.section] = { content: doc.content, date: doc.date };
      });

      const grille3By4 = generateGridHTML(groupedStickers, displayStickerImage, appreciations);

      const templatePath = "src/controllers/sticker-book/helpers/template.html";
      const template = await fs.readFile(templatePath, "utf8");

      // Convert images to base64
      const imagesBase64 = {
        coverImage: getImageBase64("src/assets/page-de-garde-carnet.png"),
        premierOutilCover: getImageBase64("src/assets/acquerir-les-premiers-outils.png"),
        activiteArtistiqueCover: getImageBase64("src/assets/agir-exprimer-activite-artistique.png"),
        agirExprimerCover: getImageBase64("src/assets/agir-exprimer-comprendre.png"),
        apprendreEnsembleCover: getImageBase64("src/assets/apprendre-ensemble.png"),
        explorerLeMondeCover: getImageBase64("src/assets/explorer-le-monde.png"),
        MobiliserLangageCover: getImageBase64("src/assets/mobiliser-le-langage.png"),
      };

      const modifiedTemplate = replaceTemplatePlaceholders(template, studentData, grille3By4, imagesBase64);
      await page.setContent(modifiedTemplate, { waitUntil: "networkidle0" });
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
      });

      await browser.close();
      return pdfBuffer;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new PDFGenerator();
