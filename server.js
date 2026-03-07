require("dotenv").config();
const path = require("path");
const express = require("express");
const helmet = require("helmet");
const nodemailer = require("nodemailer");
const { initDb, insertLead, getLeads } = require("./src/db");
const { validateLead } = require("./src/validation");

const app = express();
const DEFAULT_PORT = Number(process.env.PORT || 3000);

const courses = [
  {
    id: "sql",
    name: "SQL",
    price: "Free",
    oldPrice: "INR 200",
    description: "Beginner to advanced SQL for interviews and real projects.",
    syllabusFile: "SQL_Syllabus.pdf"
  },
  {
    id: "informatica-cloud",
    name: "Informatica Cloud",
    price: "INR 500",
    description: "IICS concepts, mappings, tasks, and real-time use cases.",
    syllabusFile: "Informatica_Cloud_IICS_CDI_Syllabus.pdf"
  },
  {
    id: "dbt",
    name: "dbt",
    price: "INR 1000",
    description: "dbt fundamentals, transformations, models, testing, and project workflow.",
    syllabusFile: "dbt_Syllabus.pdf"
  }
];

initDb();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  helmet({
    contentSecurityPolicy: false
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.get("/", (req, res) => {
  res.render("index", {
    title: "Master Job-Oriented IT Courses",
    courses
  });
});

app.get("/admin/leads", (req, res) => {
  const leads = getLeads();
  res.render("admin-leads", {
    title: "Leads Dashboard",
    leads
  });
});

app.get("/admin/leads.csv", (req, res) => {
  const leads = getLeads();
  const headers = [
    "ID",
    "Full Name",
    "Mobile Number",
    "Email Address",
    "Current Experience",
    "Interested Course",
    "Message",
    "Created At"
  ];

  const csvRows = [headers.join(",")];
  for (const lead of leads) {
    const row = [
      lead.id,
      lead.full_name,
      lead.mobile_number,
      lead.email_address,
      lead.current_experience,
      lead.interested_course,
      lead.message,
      lead.created_at
    ]
      .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
      .join(",");
    csvRows.push(row);
  }

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=leads.csv");
  res.send(csvRows.join("\n"));
});

app.get("/syllabus/:course", (req, res) => {
  const selected = courses.find((course) => course.id === req.params.course);
  if (!selected || !selected.syllabusFile) {
    return res.status(404).send("Syllabus not found.");
  }

  const syllabusPath = path.join(
    __dirname,
    "public",
    "syllabus",
    selected.syllabusFile
  );
  return res.download(syllabusPath, selected.syllabusFile);
});

app.post("/api/leads", async (req, res) => {
  const payload = {
    fullName: req.body.fullName,
    mobileNumber: req.body.mobileNumber,
    emailAddress: req.body.emailAddress,
    currentExperience: req.body.currentExperience,
    interestedCourse: req.body.interestedCourse,
    message: req.body.message
  };

  const validation = validateLead(payload);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: "Please fix the highlighted fields.",
      errors: validation.errors
    });
  }

  const insertedLead = insertLead(payload);

  sendLeadEmail(insertedLead).catch((emailError) => {
    console.error("Email sending failed:", emailError.message);
  });

  return res.status(201).json({
    success: true,
    message:
      "Thank you! We have received your details and will contact you soon."
  });
});

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === "true";
  const values = [host, user, pass].map((v) => String(v || "").trim());

  if (values.some((v) => !v)) return null;

  // Ignore placeholder .env values to avoid request delays.
  if (values.some((v) => /example\.com|your-user|your-password/i.test(v))) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 8000
  });
}

async function sendLeadEmail(lead) {
  const adminEmail = process.env.ADMIN_EMAIL || "trusanaccademy@gmail.com";
  if (!adminEmail) return;

  const html = `
    <h2>New Course Enquiry</h2>
    <p><strong>Name:</strong> ${escapeHtml(lead.full_name)}</p>
    <p><strong>Mobile:</strong> ${escapeHtml(lead.mobile_number)}</p>
    <p><strong>Email:</strong> ${escapeHtml(lead.email_address)}</p>
    <p><strong>Experience:</strong> ${escapeHtml(lead.current_experience)}</p>
    <p><strong>Course:</strong> ${escapeHtml(lead.interested_course)}</p>
    <p><strong>Message:</strong> ${escapeHtml(lead.message)}</p>
    <p><strong>Created At:</strong> ${escapeHtml(lead.created_at)}</p>
  `;

  const subject = `New Lead: ${lead.interested_course}`;
  const transporter = getTransporter();

  if (transporter) {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: adminEmail,
      subject,
      html
    });
    return;
  }

  const resendApiKey = String(process.env.RESEND_API_KEY || "").trim();
  if (resendApiKey) {
    const resendFrom =
      String(process.env.RESEND_FROM || "").trim() || "onboarding@resend.dev";
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: resendFrom,
        to: [adminEmail],
        subject,
        html
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API error ${response.status}: ${errorText}`);
    }
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

app.use((req, res) => {
  res.status(404).send("Page not found.");
});

if (require.main === module) {
  startServer(DEFAULT_PORT);
}

function startServer(port, retried = false) {
  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE" && !retried) {
      const fallbackPort = port + 1;
      console.warn(
        `Port ${port} is already in use. Retrying on http://localhost:${fallbackPort}`
      );
      startServer(fallbackPort, true);
      return;
    }
    console.error("Server startup failed:", error.message);
    process.exit(1);
  });
}

module.exports = app;
