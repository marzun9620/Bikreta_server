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
           doc.fillColor('#444')
              .fontSize(20)
              .font('Helvetica-Bold')
              .text('BIKRETA', 50, 40)
              .fontSize(15)
              .text('INVOICE', 50, 70)
              .text(`Invoice #: ${purchase.transactionId}`, 50, 95, { align: "right" })
              .fontSize(10)
              .text(`Date: ${new Date().toLocaleDateString()}`, 50, 115, { align: "right" })
              .moveDown();

           // Company Info
           doc.fontSize(15)
              .text(user.shopName, 50, 140)
              .fontSize(10)
              .text(user.location)
              .text(`Email: ${user.email}`, { underline: true })
              .moveDown(2);

           // Divider Line
           doc.strokeColor('#aaa')
              .lineWidth(1)
              .moveTo(50, 200)
              .lineTo(550, 200)
              .stroke();

           // Bill To
           doc.moveDown(2.5)
              .fontSize(15)
              .text("Bill To:", 50, 220)
              .fontSize(12)
              .text(`${user.fullName}`)
              .text(`District: ${user.districts}, Thana: ${user.thana}, House NO: ${user.houseNo}`, 50, 250)
              .text(`Email: ${user.email}`)
              .moveDown(2);

           // Products Table Headers
           const tableHeadersY = 300;
           doc.fontSize(15)
              .text("Product", 50, tableHeadersY)
              .text("Price", 280, tableHeadersY)
              .text("Quantity", 380, tableHeadersY)
              .text("Total", 480, tableHeadersY)
              .moveDown(1)
              .strokeColor('#aaa')
              .lineWidth(1)
              .moveTo(50, 325)
              .lineTo(550, 325)
              .stroke();

           // Product Line Item
           const productLineY = 340;
           doc.fontSize(12)
              .text(product.productName, 50, productLineY)
              .text(`${product.unitPrice.toFixed(2)} Tk`, 280, productLineY)
              .text(purchase.quantity.toString(), 380, productLineY)
              .text(`${(product.unitPrice * purchase.quantity).toFixed(2)} Tk`, 480, productLineY);

           // Divider Line for Total
           doc.strokeColor('#aaa')
              .lineWidth(1)
              .moveTo(50, 375)
              .lineTo(550, 375)
              .stroke();

           // Total Amount
           doc.fontSize(15)
              .text(`Total Amount: ${(product.unitPrice * purchase.quantity).toFixed(2)} Tk`, 380, 395)
              .moveDown(3);

           // Footer
           doc.fontSize(10)
              .fillColor('black')
              .text("Thank you for shopping with BIKRETA!", 50, 750, { align: 'center' })
              .text("For any queries, reach out at support@bikreta.com", 50, 770, { align: 'center' });

           // End the PDF
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
