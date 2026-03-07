# IT Course Landing Website (Lead Generation)

Modern, responsive course landing website for IT training with:
- SQL, Informatica Cloud, dbt course cards and pricing
- Enquiry modal with selected course auto-fill
- Backend lead submission API
- File-based embedded database storage (`data/leads.json`)
- Admin dashboard to view/export leads
- Optional admin email notifications via SMTP

## Tech Stack
- Node.js
- Express.js
- EJS templates
- Embedded JSON database
- Vanilla CSS + JavaScript

## Project Structure
```text
.
|-- server.js
|-- src/
|   |-- db.js
|   `-- validation.js
|-- views/
|   |-- index.ejs
|   `-- admin-leads.ejs
|-- public/
|   |-- css/styles.css
|   |-- js/main.js
|   |-- robots.txt
|   `-- sitemap.xml
|-- data/                  (created automatically)
|-- .env.example
`-- package.json
```

## Setup
1. Install Node.js 18+.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy env file:
   ```bash
   copy .env.example .env
   ```
4. (Optional) Configure SMTP values in `.env` to receive email alerts on each lead.
5. Start server:
   ```bash
   npm start
   ```
6. Open:
   - Landing page: `http://localhost:3000/`
   - Leads dashboard: `http://localhost:3000/admin/leads`

## Lead Flow
1. User clicks `Enroll / Enquire Now`.
2. Form opens with selected course pre-filled.
3. User submits form.
4. Backend validates and stores lead in the local database file (`data/leads.json`).
5. Success message shown:
   `Thank you! We have received your details and will contact you soon.`
6. Lead is visible in admin dashboard and can be downloaded as CSV.

## Important Routes
- `GET /` - Landing page
- `POST /api/leads` - Lead submission API
- `GET /admin/leads` - Admin dashboard
- `GET /admin/leads.csv` - CSV export
- `GET /syllabus/:course` - Download syllabus text file

## Deployment (Quick)
1. Push project to GitHub.
2. Deploy on Render/Railway/VPS with:
   - Build command: `npm install`
   - Start command: `npm start`
3. Set env variables from `.env.example`.
4. Ensure persistent disk storage in production (to retain `data/leads.json`).

## Notes
- Update WhatsApp number and contact email in:
  - `views/index.ejs`
- For production, add authentication to `/admin/leads`.
