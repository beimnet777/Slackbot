const fs = require('fs');
const csvParser = require('csv-parser');
const csvWriter = require('csv-writer').createObjectCsvWriter;

// Utility function to read a CSV file and return an array of rows
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function mergeCsvs(file1, file2, outputFile) {
  try {
    // Read both CSV files
    const data1 = await readCSV(file1); // expected columns: name, id
    const data2 = await readCSV(file2); // expected columns: name, slack_id
    console.log(data1,data2)

    // Create a map for file2 keyed by lower-case name for fast lookup
    const file2Map = new Map();
    data2.forEach(row => {
      if (row.name) {
        file2Map.set(row.name.trim().toLowerCase(), row.slack_id);
      }
    });

    console.log(file2Map)

    // Merge data: for each row in file1, get the matching slack_id from file2Map
    const mergedData = data1.map(row => {
      const name = row.name ? row.name.trim() : '';
      const slackId = file2Map.get(name.toLowerCase()) || '';
      return { name, id: row.id, slack_id: slackId };
    });

    // Write merged data to output CSV file
    const writer = csvWriter({
      path: outputFile,
      header: [
        { id: 'name', title: 'Name' },
        { id: 'id', title: 'ID' },
        { id: 'slack_id', title: 'Slack ID' }
      ]
    });

    await writer.writeRecords(mergedData);
    console.log(`Merged CSV written to ${outputFile}`);
  } catch (err) {
    console.error('Error merging CSV files:', err);
  }
}

// Replace these file paths with the correct paths to your CSV files
const file2 = '../employeeId.csv'; // CSV with columns: name, id
const file1 = '../Employee Data.xlsx - employees directory.csv'; // CSV with columns: name, slack_id
const outputFile = '../merged.csv';

// Run the merge function
mergeCsvs(file1, file2, outputFile);
