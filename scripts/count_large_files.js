const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, '..', 'Site_Web', 'covoiturage_la_cite_site_web');
const SOURCE_EXTENSIONS = ['.tsx', '.ts', '.js', '.jsx'];
const MIN_LINES = 300;
const EXCLUDED_DIRS = ['node_modules', '.next'];

function countLines(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.split('\n').length;
}

function walkDir(dir, results = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (EXCLUDED_DIRS.includes(file)) continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath, results);
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

function main() {
  const allFiles = walkDir(TARGET_DIR);
  const largeFiles = [];

  for (const file of allFiles) {
    const ext = path.extname(file).toLowerCase();
    if (SOURCE_EXTENSIONS.includes(ext)) {
      const lines = countLines(file);
      if (lines > MIN_LINES) {
        const relativePath = path.relative(process.cwd(), file);
        largeFiles.push({ path: relativePath, lines });
      }
    }
  }

  // Sort by line count descending
  largeFiles.sort((a, b) => b.lines - a.lines);

  // Output results
  for (const { path: filePath, lines } of largeFiles) {
    console.log(`${filePath}: ${lines}`);
  }

  console.log(`\nTotal: ${largeFiles.length} fichiers dépassant ${MIN_LINES} lignes`);
}

main();
