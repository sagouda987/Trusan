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
|-- api/
|   `-- index.js
|-- vercel.json
|-- render.yaml
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
- `GET /syllabus/:course` - Download syllabus PDF
- `GET /health` - Health check

## Deployment on Render (Recommended)
For free setup, this project can run on Render Free tier.

1. Push code to GitHub.
2. In Render dashboard, click **New +** -> **Blueprint**.
3. Connect your GitHub repo and select this project.
4. Render reads `render.yaml` automatically.
5. Confirm service creation and deploy.
6. In Render service settings, verify:
   - `DATA_DIR=/tmp/trusan`
   - `ADMIN_EMAIL=trusanaccademy@gmail.com`
7. For email alerts on Render Free, configure Resend API:
   - `RESEND_API_KEY=<your_resend_api_key>`
   - `RESEND_FROM=<verified_sender_email_or_domain>`
   - Keep SMTP values empty on free tier.

Free-tier note:
- `/tmp` storage is ephemeral. Leads may reset on restart/redeploy.
- Upgrade later to paid disk + managed DB for durable lead storage.
- Render Free blocks common SMTP ports, so SMTP email may not work there.

## Deployment on Vercel
Vercel config is included (`vercel.json`), but Vercel serverless file storage is ephemeral, so lead data is not reliable long-term with local JSON DB.

1. Import the GitHub repo into Vercel.
2. Framework preset: **Other**.
3. Deploy with default settings.
4. If you use Vercel for production, move leads to managed DB first.

## Notes
- Update WhatsApp number and contact email in:
  - `views/index.ejs`
- For production, add authentication to `/admin/leads`.
- To store leads on Render disk, app already supports `DATA_DIR` environment variable.
