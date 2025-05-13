const QRCode = require('qrcode');

const generateQRCode = async (text) => {
    try {
        return await QRCode.toDataURL(text); // returns base64 string
    } catch (err) {
        console.error('QR Code generation failed', err);
        return null;
    }
};

module.exports = generateQRCode;
