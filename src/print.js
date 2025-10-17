const printer = require('printer');
const fs = require('fs');

// Path to the file you want to print
const filePath = './test.txt'; // Change this to your file path

// Read file content
const fileBuffer = fs.readFileSync(filePath);

// Send file to default printer
printer.printDirect({
  data: fileBuffer,
  type: 'RAW', // Use 'RAW' for text files, 'PDF' for PDFs
  success: function (jobID) {
    console.log(`Sent to printer with Job ID: ${jobID}`);
  },
  error: function (err) {
    console.error('Print failed:', err);
  }
});
