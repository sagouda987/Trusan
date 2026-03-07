const fs = require("fs");
const path = require("path");
const dataDir = path.join(__dirname, "..", "data");
const dbPath = path.join(dataDir, "leads.json");

function initDb() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dbPath)) {
    const seed = { lastId: 0, leads: [] };
    fs.writeFileSync(dbPath, JSON.stringify(seed, null, 2), "utf8");
  }
}

function insertLead(lead) {
  const db = readDb();
  const createdAt = new Date().toISOString();
  const row = {
    id: db.lastId + 1,
    full_name: lead.fullName.trim(),
    mobile_number: lead.mobileNumber.trim(),
    email_address: lead.emailAddress.trim(),
    current_experience: lead.currentExperience.trim(),
    interested_course: lead.interestedCourse.trim(),
    message: lead.message.trim(),
    created_at: createdAt
  };

  db.lastId = row.id;
  db.leads.push(row);
  writeDb(db);
  return row;
}

function getLeads() {
  const db = readDb();
  return db.leads.sort((a, b) => b.id - a.id);
}

function readDb() {
  const raw = fs.readFileSync(dbPath, "utf8");
  return JSON.parse(raw);
}

function writeDb(content) {
  fs.writeFileSync(dbPath, JSON.stringify(content, null, 2), "utf8");
}

module.exports = {
  initDb,
  insertLead,
  getLeads
};
