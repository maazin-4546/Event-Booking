const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');


const generateTicketPDF = async (userId, event) => {
    try {
        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();

        // Embed font
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        // Add a page
        const page = pdfDoc.addPage([400, 250]);

        // Basic styling
        const titleSize = 18;
        const textSize = 12;

        page.drawText('Event Ticket', {
            x: 150,
            y: 220,
            size: titleSize,
            font,
            color: rgb(0.2, 0.2, 0.8),
        });

        page.drawText(`Event: ${event.title}`, {
            x: 50,
            y: 180,
            size: textSize,
            font,
            color: rgb(0, 0, 0),
        });

        page.drawText(`User ID: ${userId}`, {
            x: 50,
            y: 160,
            size: textSize,
            font,
        });

        page.drawText(`Location: ${event.location}`, {
            x: 50,
            y: 140,
            size: textSize,
            font,
        });

        page.drawText(`Date: ${new Date(event.date).toLocaleString()}`, {
            x: 50,
            y: 120,
            size: textSize,
            font,
        });

        page.drawText(`Issued At: ${new Date().toLocaleString()}`, {
            x: 50,
            y: 100,
            size: textSize,
            font,
            color: rgb(0.3, 0.3, 0.3),
        });

        // Serialize PDF and save it
        const pdfBytes = await pdfDoc.save();

        const fileName = `ticket_${userId}_${event._id}.pdf`;
        const outputPath = path.join(__dirname, '../tickets', fileName);

        // Ensure the folder exists
        const folderPath = path.dirname(outputPath);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        fs.writeFileSync(outputPath, pdfBytes);

        // Return the file path or just file name
        return fileName;
    } catch (error) {
        console.error('Failed to generate PDF:', error);
        return null;
    }
};


module.exports = generateTicketPDF;
