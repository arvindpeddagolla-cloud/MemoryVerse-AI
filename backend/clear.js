import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, 'local_db.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

function clear() {
  console.log('Wiping all demo configurations and database records...');

  // 1. Reset database to empty tables
  const freshDb = {
    users: {},
    documents: [],
    projects: [],
    certificates: [],
    skills: [],
    internships: [],
    achievements: [],
    timeline: [],
    relationships: [],
    careerInsights: {},
    notifications: [],
    resumeVersions: []
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(freshDb, null, 2));
  console.log('✓ local_db.json reset successfully.');

  // 2. Clear all physical mock uploads
  if (fs.existsSync(UPLOADS_DIR)) {
    const files = fs.readdirSync(UPLOADS_DIR);
    let count = 0;
    files.forEach(file => {
      const filepath = path.join(UPLOADS_DIR, file);
      try {
        fs.unlinkSync(filepath);
        console.log(`Deleted mock file: ${file}`);
        count++;
      } catch (err) {
        console.error(`Failed to delete file ${file}:`, err.message);
      }
    });
    console.log(`✓ Deleted ${count} mock file(s) from uploads.`);
  }

  console.log('Reset complete! Database is now empty and fresh.');
}

clear();
