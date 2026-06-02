const PDFDocument = require("pdfkit");

const QRCode = require("qrcode");

const fs = require("fs");

const path = require("path");

const prisma = require("../config/prisma");



const generateTicket = async (booking) => {

  return new Promise(async (resolve, reject) => {

    try {

      const ticketsDir = path.join(__dirname, "../../tickets");



      if (!fs.existsSync(ticketsDir)) {

        fs.mkdirSync(ticketsDir);
      }



      const filePath = path.join(

        ticketsDir,

        `${booking.bookingId}.pdf`
      );



      const doc = new PDFDocument();



      const stream = fs.createWriteStream(filePath);



      doc.pipe(stream);

      stream.on("error", (err) => {
        reject(err);
      });



      // HEADER

      doc

        .fontSize(24)

        .text("RSM Wave Valley Water Park", {

          align: "center"
        });



      doc.moveDown();



      doc

        .fontSize(18)

        .text("E-Ticket", {

          align: "center"
        });



      doc.moveDown(2);



      // BOOKING DETAILS

      doc.fontSize(14);

      doc.text(`Booking ID: ${booking.bookingId}`);

      doc.text(`Name: ${booking.name}`);

      doc.text(`Mobile: ${booking.mobile}`);

      doc.text(`Visit Date: ${new Date(
        booking.visitDate
      ).toDateString()}`);

      doc.text(`People Count: ${booking.peopleCount}`);

      doc.text(`Total Amount: ₹${booking.totalAmount}`);

      doc.text(`Payment Status: ${booking.paymentStatus}`);



      doc.moveDown(2);



      // QR CODE DATA

      const qrData = `
Booking ID: ${booking.bookingId}
Name: ${booking.name}
Mobile: ${booking.mobile}
Visit Date: ${booking.visitDate}
`;



      const qrImage = await QRCode.toDataURL(qrData);



      const base64Data = qrImage.replace(

        /^data:image\/png;base64,/,

        ""
      );



      const qrBuffer = Buffer.from(base64Data, "base64");



      doc.image(qrBuffer, {

        fit: [150, 150],

        align: "center"
      });



      doc.moveDown(2);



      doc

        .fontSize(12)

        .text("Please show this ticket at entry gate.", {

          align: "center"
        });



      doc.end();



      stream.on("finish", async () => {
        try {
          const relativeUrl = `/tickets/${booking.bookingId}.pdf`;
          try {
            await prisma.ticket.create({
              data: {
                bookingId: booking.id,
                ticketUrl: relativeUrl
              }
            });
            console.log(`[TICKET DATABASE SUCCESS] Registered ticket path: ${relativeUrl}`);
            resolve(filePath);
          } catch (dbErr) {
            console.error("[TICKET DATABASE ERROR] Unable to store Ticket record in MySQL:", dbErr.message);
            reject(dbErr);
          }
        } catch (err) {
          reject(err);
        }
      });

    } catch (error) {

      reject(error);
    }
  });
};



module.exports = {

  generateTicket
};