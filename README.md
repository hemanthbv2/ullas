# R.V Institute of Technology and Management (RVITM)
## Modern Admissions Portal & AI-Powered Admission Advisor

Official admissions landing page and interactive conversational AI advisor for **R.V Institute of Technology and Management (RVITM)**, located in JP Nagar, Bengaluru (managed by Rashtreeya Sikshana Samithi Trust - RSST, approved by AICTE, affiliated to VTU Belagavi).

---

### Features & Highlights

1. **Modern Admissions Landing Page**:
   - High-impact hero section with interactive 2026-27 admissions countdown timer.
   - Comprehensive program cards for B.E. in **CSE**, **AI & ML**, **ISE**, and **ECE**.
   - Detailed KCET & COMEDK quota cutoffs, fees breakdown, and institutional scholarships.
   - Placement stats highlighting RV Group's centralized placement training (highest package ₹62 LPA, 200+ recruiters).

2. **Admission Enquiry & Lead Generation Form**:
   - Client-side and server-side strict email and GPA validation.
   - Instant on-screen receipt with official reference ID and applicant summary.
   - Contact instructions with official Department helpline numbers, direct email (`admissions@rvitm.edu.in`), and campus office hours.
   - Persists student enquiries to `data/enquiries.json`.

3. **Interactive AI Admission Advisor**:
   - Floating glassmorphism chatbot widget available across all pages.
   - Dedicated full-screen consultation console at `/chat`.
   - **Mandatory Email Verification Gate**: Collects and validates prospective student email before enabling chat queries.
   - Switch/re-verify email button to easily change or reset sessions.
   - Natural Language query handling with fuzzy keyword intent matching powered by `knowledge_base.json`.
   - Quick-reply chips with horizontal slide & mouse wheel drag support.

---

### Project Structure

```text
├── app.py                   # Flask web server & REST API endpoints
├── knowledge_base.json      # Knowledge base for RVITM admissions & FAQ
├── requirements.txt         # Python dependencies
├── data/
│   ├── enquiries.json       # Submitted prospective student enquiries
│   └── visitors.json        # Verified visitor email registrations
├── static/
│   ├── css/
│   │   └── style.css        # Responsive styling & glassmorphic theme
│   ├── images/              # Campus and student imagery
│   └── js/
│       ├── main.js          # Landing page interactions & enquiry handling
│       └── chatbot.js       # Floating AI chatbot widget logic & email gate
└── templates/
    ├── index.html           # Main admissions landing page
    └── chat_page.html       # Dedicated full-screen AI advisor page
```

---

### Setup and Running Locally

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the Application**:
   ```bash
   python app.py
   ```

3. **Access the Portal**:
   - Admissions Landing Page: [http://127.0.0.1:5000/](http://127.0.0.1:5000/)
   - Dedicated AI Advisor: [http://127.0.0.1:5000/chat](http://127.0.0.1:5000/chat)
