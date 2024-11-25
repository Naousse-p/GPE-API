const { TreasuryTransaction, TreasuryClassroom, TreasurySchool } = require("../../../models");
const { getItemById, updateItem, getOneItem } = require("../../../utils/db-generic-services.utils");
const { saveSourceFile } = require("../../../utils/multer");
const fs = require("fs");
const path = require("path");

exports.treasury_update_transaction_service = async (transactionId, updateData, req) => {
  try {
    // Vérifier l'existence de la transaction
    const transaction = await getItemById(TreasuryTransaction, transactionId);
    if (!transaction) {
      throw { code: 404, message: "Transaction not found" };
    }

    // Vérifier que la transaction n'est pas marquée comme remboursée
    if (transaction.status === "reimbursed") {
      throw { code: 400, message: "Cannot update a reimbursed transaction" };
    }
    const oldAmount = transaction.amount;
    let newAmount = oldAmount;
    if (updateData.amount !== undefined && updateData.amount !== oldAmount) {
      newAmount = updateData.amount;
    }

    const amountDifference = newAmount - oldAmount;

    // Mettre à jour les champs de la transaction
    Object.keys(updateData).forEach((key) => {
      transaction[key] = updateData[key];
    });

    // Gérer la mise à jour du fichier si la transaction est un achat
    if (transaction.type === "purchase" && req.file?.buffer) {
      const uploadDir = path.join(__dirname, "../../../../", "uploads/receipts");
      if (transaction.receipts) {
        const existingFilePath = path.join(uploadDir, transaction.receipts);
        console.log("existingFilePath", existingFilePath);
        if (fs.existsSync(existingFilePath)) {
          fs.unlinkSync(existingFilePath);
        }
      }
      const receipts = await saveSourceFile(req.file.buffer, `${transaction._id}`, "receipts", req.file.originalname.split(".").pop(), true);
      transaction.receipts = receipts;
    }

    // Enregistrer les modifications dans la base de données
    const updatedTransaction = await updateItem(TreasuryTransaction, transactionId, transaction);

    // Mettre à jour le budget de la classe ou de l'école en fonction du type de transaction
    if (transaction.type === "collection" && transaction.schoolTreasury) {
      console.log("schoolTreasury", transaction.schoolTreasury);
      await updateSchoolTreasuryBudget(transaction.schoolTreasury, newAmount, amountDifference, transaction.type, transaction.classTreasury);
    } else if (transaction.classTreasury) {
      console.log("classTreasury", transaction.classTreasury);
      await updateClassTreasuryBudget(transaction.classTreasury, newAmount, amountDifference, transaction.type, transaction.schoolTreasury, updateData);
    } else if (transaction.schoolTreasury) {
      console.log("schoollllllTreasury", transaction.schoolTreasury);
      await updateSchoolTreasuryBudget(transaction.schoolTreasury, newAmount, amountDifference, transaction.type, transaction.classTreasury);
    }

    return updatedTransaction;
  } catch (error) {
    throw { code: error.code || 500, message: error.message };
  }
};

const updateClassTreasuryBudget = async (classTreasuryId, newAmount, amountDifference, transactionType, schoolTreasuryId, updateData) => {
  const classTreasury = await TreasuryClassroom.findById(classTreasuryId).populate("class");
  if (!classTreasury) {
    throw { code: 404, message: "Class treasury not found" };
  }
  const schoolTreasury = await getOneItem(TreasurySchool, { school: classTreasury.class.school });
  if (!schoolTreasury) {
    throw { code: 404, message: "School treasury not found" };
  }
  if (updateData.status === "reimbursed") {
    // on déduit le montant de la transaction au budget de la classe
    classTreasury.allocatedBudget -= newAmount;
  }

  if (transactionType === "purchase") {
    if (amountDifference < 0) {
      // Si le montant a été diminué, ajouter la différence au budget
      classTreasury.allocatedBudget += Math.abs(amountDifference);
    } else {
      // Si le montant a été augmenté, soustraire la différence du budget
      classTreasury.allocatedBudget -= amountDifference;
    }
  } else if (transactionType === "collection") {
    schoolTreasury.cooperativeBudget += amountDifference;
  }
  if (schoolTreasuryId) {
    schoolTreasury.cooperativeBudget -= amountDifference;
  }
  await classTreasury.save();
};

const updateSchoolTreasuryBudget = async (schoolTreasuryId, newAmount, amountDifference, transactionType, classTreasuryId) => {
  const schoolTreasury = await getOneItem(TreasurySchool, { school: schoolTreasuryId });
  if (!schoolTreasury) {
    throw { code: 404, message: "School treasury not found" };
  }
  if (transactionType === "purchase") {
    if (amountDifference < 0) {
      // Si le montant a été diminué, ajouter la différence au budget
      schoolTreasury.cooperativeBudget += Math.abs(amountDifference);
    } else {
      // Si le montant a été augmenté, soustraire la différence du budget
      schoolTreasury.cooperativeBudget -= amountDifference;
    }
  } else if (transactionType === "collection") {
    schoolTreasury.cooperativeBudget += amountDifference;
  }
  await schoolTreasury.save();
};
