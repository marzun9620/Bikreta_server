const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const bwipjs = require('bwip-js');

const { User } = require('../models/user');
const Product = require('../models/Product');

const generateOverallPDF = async (purchases, userId, trans_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await User.findOne({ _id: userId });
            if (!user) {
                reject(new Error("User not found"));
                return;
            }

            const doc = new PDFDocument({ margin: 50 });
            const pdfPath = path.join(__dirname, '..', 'public', 'pdfs', `${trans_id}.pdf`);
            const writeStream = fs.createWriteStream(pdfPath);
            doc.pipe(writeStream);

            // Header
            // Company Info
            doc
                .fillColor('#3498db') // Blue color
                .fontSize(30)
                .text('BIKRETA', 50, 100) // Company name
                .fontSize(15)
                .fillColor('#2c3e50') // Dark Gray color
                .text(user.location)
                .text(`Email: ${user.email}`, { underline: true })
                .moveDown(2);

            // Divider Line
            doc.strokeColor('#3498db') // Blue color
                .lineWidth(2)
                .moveTo(50, 200)
                .lineTo(550, 200)
                .stroke();

            // Bill To
            doc.moveDown(2.5)
                .fontSize(15)
                .fillColor('#3498db') // Blue color
                .text("Bill To:", 50, 220)
                .fontSize(12)
                .fillColor('#2c3e50') // Dark Gray color
                .text(`${user.fullName}`)
                .text(`District: ${user.districts}, Thana: ${user.thana}, House NO: ${user.houseNo}`, 50, 250)
                .text(`Email: ${user.email}`)
                .moveDown(2);

            // Transaction Details
            doc
                .fontSize(12)
                .fillColor('#3498db') // Blue color
                .text(`Transaction ID: ${trans_id}`, 50, 300)
                .text(`Date: ${new Date().toLocaleDateString()}`, 50, 320)
                .moveDown(1);

            // Overall Checkout Table Headers
            const tableHeadersY = 350;
            doc
                .fontSize(15)
                .fillColor('#3498db') // Blue color
                .text("Product", 50, tableHeadersY)
                .text("Quantity", 280, tableHeadersY)
                .text("Total Amount", 380, tableHeadersY)
                .moveDown(1)
                .strokeColor('#3498db') // Blue color
                .lineWidth(2)
                .moveTo(50, 375)
                .lineTo(550, 375)
                .stroke();

            let overallLineY = 400;

            purchases.forEach((purchase, index) => {
                const { product, quantity, price } = purchase;

                // Check if the content fits on the current page
                if (overallLineY + 50 > doc.page.height) {
                    // Start a new page if there isn't enough space
                    doc.addPage();
                    overallLineY = 50; // Reset Y coordinate
                }

                doc
                    .fontSize(12)
                    .fillColor('#2c3e50') // Dark Gray color
                    .text(product.productName, 50, overallLineY)
                    .text(quantity.toString(), 280, overallLineY)
                    .text(`${price.toFixed(2)} Tk`, 380, overallLineY);

                overallLineY += 20;
            });

            // Divider Line for Total
            doc.strokeColor('#3498db') // Blue color
                .lineWidth(2)
                .moveTo(50, overallLineY)
                .lineTo(550, overallLineY)
                .stroke();

            // Total Quantity and Amount
            const totalQuantity = purchases.reduce((acc, purchase) => acc + purchase.quantity, 0);
            const totalAmount = purchases.reduce((acc, purchase) => acc + purchase.price, 0);

            doc
                .fontSize(15)
                .fillColor('#3498db') // Blue color
                .text(`Total Quantity: ${totalQuantity}`, 180, overallLineY + 30)
                .text(`Total Amount: ${totalAmount.toFixed(2)} Tk`, 380, overallLineY + 30)
                .moveDown(2);

            // Bar code generation
            const barcodeOpts = {
                bcid: 'code128', // Barcode type
                text: trans_id,    // Text to encode
                scale: 2,         // 2x scaling factor
                height: 10,       // Bar height, in millimeters
                includetext: true // Include human-readable text
            };

            // Draw barcode only if there's enough space
            if (overallLineY + 50 < doc.page.height) {
                bwipjs.toBuffer(barcodeOpts, (err, png) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    doc.image(png, 50, overallLineY + 300, { width: 150 });
                    doc.moveDown(0);
                    // End the PDF
                    doc.end();
                });
            } else {
                // End the PDF without drawing the barcode
                doc.end();
            }

            // Resolve the promise with the path once the stream has finished writing
            writeStream.on('finish', () => {
                resolve(`/pdfs/${trans_id}.pdf`);
            });

            // Handle errors during stream writing
            writeStream.on('error', (error) => {
                reject(error);
            });

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    generateOverallPDF
};
