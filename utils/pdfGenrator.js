const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const { User } = require('../models/user');
const Product = require('../models/Product');

const generatePDF = async (purchase, userId, productId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({ _id: userId });
            if (!user) {
                reject(new Error("User not found"));
                return;
            }

            const product = await Product.findOne({ _id: productId });
            if (!product) {
                reject(new Error("Product not found"));
                return;
            }

            const doc = new PDFDocument({ margin: 50 });
            const pdfPath = path.join(__dirname, '..', 'public', 'pdfs', `${purchase.transactionId}.pdf`);
            const writeStream = fs.createWriteStream(pdfPath);
            doc.pipe(writeStream);

            // Header
            doc.fontSize(25)
               .fillColor('#444')
               .text(`Invoice #${purchase.transactionId}`, 50, 50, { align: "center" });

            // Invoice Date
            doc.fontSize(15)
               .text(`Invoice Date: ${new Date(purchase.orderPlacedDate).toLocaleDateString()}`, { align: "right" })
               .moveDown();

            // Company Information
            doc.moveDown(2)
               .strokeColor("#aaa")
               .lineWidth(5)
               .moveTo(50, doc.y)
               .lineTo(550, doc.y)
               .stroke()
               .moveDown(1);
            doc.fontSize(10)
               .text(user.shopName)
               .text(user.location, { align: "right" })
               .text(user.email, { align: "right" })
               .moveDown(2);

            // Bill To
            doc.fontSize(15)
               .fillColor('#888')
               .text("Bill To:")
               .moveDown(0.5)
               .fontSize(10)
               .fillColor('#444')
               .text(`${user.fullName}`)
               .text(`Address: District:${user.districts} . Thana:${user.thana}. House NO: ${user.houseNo}`)
               .text(`Email: ${user.email}`)
               .moveDown(2);

            // Products Table
            doc.fillColor('#444')
               .fontSize(15)
               .text("Product", 50)
               .text("Price", 250)
               .text("Quantity", 350)
               .text("Total", 450);

            // Table Rows
            doc.moveDown(1.5)
               .fillColor('#555')
               .fontSize(12)
               .text(product.productName, 50, doc.y)
               .text(`$${product.unitPrice}`, 250, doc.y)
               .text(purchase.quantity.toString(), 350, doc.y)
               .text(`$${product.unitPrice * purchase.quantity}`, 450, doc.y)
               .moveDown(2);

            // Total Amount
            doc.fillColor('#555')
               .fontSize(15)
               .text(`Total Amount: $${product.unitPrice * purchase.quantity}`, { align: 'right' })
               .moveDown(3);

            // Footer
            doc.fontSize(10)
               .fillColor('black')
               .text("Thank you for your purchase!", 50, 700, { align: 'center' });

            // Finalize the PDF
            doc.end();

            writeStream.on('finish', () => {
                resolve(`/pdfs/${purchase.transactionId}.pdf`);
            });

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    generatePDF
};
