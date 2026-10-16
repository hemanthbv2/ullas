import os
import json
import re
import datetime
import uuid
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
KB_PATH = os.path.join(BASE_DIR, "knowledge_base.json")
DATA_DIR = os.path.join(BASE_DIR, "data")
ENQUIRIES_PATH = os.path.join(DATA_DIR, "enquiries.json")
VISITORS_PATH = os.path.join(DATA_DIR, "visitors.json")

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)
if not os.path.exists(ENQUIRIES_PATH):
    with open(ENQUIRIES_PATH, "w", encoding="utf-8") as f:
        json.dump([], f, indent=2)

if not os.path.exists(VISITORS_PATH):
    with open(VISITORS_PATH, "w", encoding="utf-8") as f:
        json.dump([], f, indent=2)

# Load Knowledge Base
def load_knowledge_base():
    try:
        with open(KB_PATH, "r", encoding="utf-8-sig") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading knowledge base: {e}")
        return {}

kb = load_knowledge_base()

def validate_email(email):
    if not email or not isinstance(email, str):
        return False
    regex = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return re.match(regex, email.strip()) is not None

def generate_ai_response(user_msg, history=None, user_email=None, user_name=None):
    """
    Intelligent Admission Advisor Engine tailored for
    R.V Institute of Technology and Management (RVITM) Bangalore.
    """
    msg = user_msg.lower().strip()
    name_prefix = f" {user_name}" if user_name else ""
    
    # 1. Greetings
    if re.search(r"^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|howdy)\b", msg):
        return {
            "reply": f"👋 **Hello{name_prefix}! Welcome to R.V Institute of Technology and Management (RVITM), Bengaluru.**\n\nI am your **AI Admission Advisor**. RVITM is established under the prestigious **Rashtreeya Sikshana Samithi Trust (RSST)**, affiliated with VTU Belagavi, and approved by AICTE.\n\nI can assist you with:\n- B.E. Programs (CSE, AI & ML, ISE, ECE)\n- KCET / COMEDK / Management Quota cutoffs & fees\n- Centralized RV Placements (98.2% record, ₹54.5 LPA highest package)\n- Campus Facilities in JP Nagar, Bengaluru\n\nWhat would you like to explore today?",
            "suggestions": [
                "🎓 B.E. Programs at RVITM",
                "💰 Fee Structure & Quotas",
                "🚀 Placement Records",
                "📝 Apply / Submit Enquiry"
            ]
        }
    
    # 2. Email / Enquiry intent
    if any(k in msg for k in ["enquiry", "apply", "counselor", "contact human", "speak with", "admission form", "seat booking"]):
        return {
            "reply": "📋 **Direct Admission Guidance & Seat Allotment:**\n\nYou can submit an official **Admission Enquiry** directly on this portal. We will need your **name, verified email ID, phone number, and chosen engineering branch**.\n\nOur RVITM Admissions Desk in JP Nagar, Bengaluru will evaluate your KCET/COMEDK/12th marks and guide you through provisional seat booking within 24 hours.",
            "suggestions": [
                "📝 Open Enquiry Form",
                "💰 Scholarship & Fee Concessions",
                "🏛️ Campus Address & Directions"
            ],
            "action": {
                "type": "scroll_to",
                "target": "#enquiry-section"
            }
        }
    
    # 3. Programs & Branches
    if any(k in msg for k in ["program", "course", "major", "branch", "degree", "be", "b.e", "btech", "engineering"]):
        if any(k in msg for k in ["ai", "aiml", "artificial intelligence", "machine learning"]):
            p = next((x for x in kb["programs"] if x["id"] == "be-aiml"), None)
            return {
                "reply": f"🤖 **{p['name']}** at RVITM\n\n- **Degree**: {p['degree']}\n- **Duration**: {p['duration']}\n- **Fees**: {p['annual_tuition']}\n- **Curriculum Highlights**: {p['overview']}\n- **Eligibility**: {p['eligibility']}\n- **Top Career Profiles**: {', '.join(p['career_roles'])}\n\n*Intake: {p['seats']} Seats.*",
                "suggestions": [
                    "📝 Enquire for AI & ML",
                    "💰 Fee Structure & Scholarships",
                    "🚀 Placements in AI"
                ],
                "action": {
                    "type": "fill_enquiry",
                    "program": "B.E. in Artificial Intelligence & Machine Learning"
                }
            }
        elif any(k in msg for k in ["cse", "computer science", "software", "coding"]):
            p = next((x for x in kb["programs"] if x["id"] == "be-cse"), None)
            return {
                "reply": f"💻 **{p['name']}** at RVITM\n\n- **Degree**: {p['degree']}\n- **Duration**: {p['duration']}\n- **Fees**: {p['annual_tuition']}\n- **Focus**: {p['overview']}\n- **Eligibility**: {p['eligibility']}\n\nRVITM students participate in **centralized placements** alongside the RV educational group, giving direct access to tech recruiters like Microsoft, Amazon, Cisco, and Google.",
                "suggestions": [
                    "📝 Enquire for CSE",
                    "🚀 Placement Statistics",
                    "💰 COMEDK / KCET Quota"
                ],
                "action": {
                    "type": "fill_enquiry",
                    "program": "B.E. in Computer Science & Engineering"
                }
            }
        elif any(k in msg for k in ["ise", "information science", "information technology"]):
            p = next((x for x in kb["programs"] if x["id"] == "be-ise"), None)
            return {
                "reply": f"📊 **{p['name']}** at RVITM\n\n- **Duration**: {p['duration']}\n- **Fees**: {p['annual_tuition']}\n- **Overview**: {p['overview']}\n- **Career Pathways**: Information Systems Architect, DevOps, Cloud Engineer, Full-Stack Developer.\n- **Eligibility**: {p['eligibility']}",
                "suggestions": [
                    "📝 Enquire for ISE",
                    "📅 Admission Deadlines",
                    "💰 Fee Structure"
                ],
                "action": {
                    "type": "fill_enquiry",
                    "program": "B.E. in Information Science & Engineering"
                }
            }
        elif any(k in msg for k in ["ece", "electronics", "communication", "vlsi", "embedded"]):
            p = next((x for x in kb["programs"] if x["id"] == "be-ece"), None)
            return {
                "reply": f"⚡ **{p['name']}** at RVITM\n\n- **Duration**: {p['duration']}\n- **Tuition**: {p['annual_tuition']}\n- **Highlights**: VLSI design labs, Embedded IoT, Robotics, and Signal Processing.\n- **Top Recruiters for ECE**: Bosch, Intel, Qualcomm, Texas Instruments, Cisco.\n- **Eligibility**: {p['eligibility']}",
                "suggestions": [
                    "📝 Enquire for ECE",
                    "🏫 Innovation & VLSI Labs",
                    "📅 Application Process"
                ],
                "action": {
                    "type": "fill_enquiry",
                    "program": "B.E. in Electronics & Communication Engineering"
                }
            }
        else:
            prog_list = "\n".join([f"• **{p['name']}** ({p['duration']}) — Seats: {p['seats']}" for p in kb["programs"]])
            return {
                "reply": f"🎓 **Undergraduate & Postgraduate Engineering Programs at RVITM:**\n\n{prog_list}\n\nWhich department are you interested in pursuing?",
                "suggestions": [
                    "💻 Computer Science (CSE)",
                    "🤖 Artificial Intelligence (AI & ML)",
                    "📊 Information Science (ISE)",
                    "⚡ Electronics & Comm (ECE)"
                ]
            }

    # 4. KCET / COMEDK / Quotas / Cutoffs
    if any(k in msg for k in ["kcet", "comedk", "kea", "cutoff", "rank", "quota", "management quota", "mgmt"]):
        return {
            "reply": "🎯 **Admission Channels & Quotas at RVITM:**\n\n1. **KCET (KEA Quota)**: For Karnataka domicile candidates through state counseling. Subsidized government fee (~₹98,000/yr).\n2. **COMEDK Quota**: Open to all-India merit candidates based on COMEDK UGET rank (~₹2,64,000/yr).\n3. **Management Quota**: Direct institutional admissions based on 10+2 / PUC academic merit (minimum 50% in PCM) and entrance performance.\n\nWould you like guidance on expected cutoffs or securing a seat through the management round?",
            "suggestions": [
                "📝 Enquire for Management Quota",
                "💰 View Fee Breakdown",
                "📅 2026 Important Dates"
            ]
        }

    # 5. Deadlines & Intakes
    if any(k in msg for k in ["deadline", "date", "when", "intake", "last date", "schedule"]):
        d_text = "\n".join([
            f"• **{d['intake']} ({d['round']})**:\n  - Deadline: **{d['deadline_date']}**\n  - Mode: {d['decision_date']}"
            for d in kb["admissions"]["deadlines"]
        ])
        return {
            "reply": f"📅 **Admission Schedule (Academic Year 2026-2027):**\n\n{d_text}\n\n💡 *Note: Institutional and Management Merit seats are processed on a rolling basis. Early enquiry is recommended as branch seats fill rapidly.*",
            "suggestions": [
                "📝 Register Enquiry Now",
                "🎓 Explore B.E. Branches",
                "📄 Documents Checklist"
            ]
        }

    # 6. Scholarships & Aid
    if any(k in msg for k in ["scholarship", "financial aid", "waiver", "concession", "fee reduction"]):
        s_text = "\n".join([
            f"• **{s['name']}**\n  - Benefit: **{s['coverage']}**\n  - Criteria: {s['eligibility']}"
            for s in kb["scholarships"]
        ])
        return {
            "reply": f"💰 **Scholarships & Financial Assistance at RVITM:**\n\nBacked by the **RSST Trust**, we offer merit-based and social welfare support:\n\n{s_text}\n\nOur admission officers evaluate your eligibility during document verification.",
            "suggestions": [
                "📝 Submit Profile for Evaluation",
                "💵 Check Tuition Fees",
                "🎓 Explore CSE / AI & ML"
            ]
        }

    # 7. Tuition & Fees
    if any(k in msg for k in ["fee", "tuition", "cost", "how much", "price", "package"]):
        fee_list = "\n".join([f"• **{p['name']}**: {p['annual_tuition']}" for p in kb["programs"]])
        return {
            "reply": f"💳 **Fee Structure (2026-2027 Academic Year):**\n\n{fee_list}\n\n*Hostel, mess, and VTU university examination fees are payable separately. Concessions are available for top-ranking merit scholars.*",
            "suggestions": [
                "🏠 Hostel & Mess Fees",
                "💰 Scholarship Options",
                "📝 Request Fee Brochure"
            ]
        }

    # 8. Placements & Career
    if any(k in msg for k in ["placement", "job", "salary", "package", "recruiter", "companies", "highest"]):
        stats = kb["placement_highlights"]
        companies = ", ".join(stats["top_recruiters"])
        return {
            "reply": f"🚀 **Centralized RV Placement Excellence:**\n\n- **Placement Success**: **{stats['placement_percentage']}**\n- **Highest Package Offered**: **{stats['highest_salary']}**\n- **Median / Average Package**: **{stats['median_salary']}**\n- **Leading Recruiters**: {companies}\n\nRVITM students benefit from the **joint placement cell** of the RV educational consortium, bringing over 300+ Fortune 500 tech companies to campus.",
            "suggestions": [
                "💻 B.E. Computer Science",
                "🤖 B.E. AI & ML",
                "📝 Apply for 2026 Batch"
            ]
        }

    # 9. Campus Life & Location
    if any(k in msg for k in ["campus", "hostel", "location", "address", "where", "jp nagar", "bangalore", "bengaluru", "facility"]):
        c = kb["campus_life"]
        u = kb["university"]
        return {
            "reply": f"🏛️ **Campus & Facilities at RVITM:**\n\n- **Location**: {u['location']}\n- **Hostels**: {c['accommodation']}\n- **Cafeteria**: {c['dining']}\n- **Recreation**: {c['sports_recreation']}\n- **Student Clubs**: {c['clubs']}\n\nLocated in the tech and residential hub of **JP Nagar 8th Phase, Bengaluru**, the campus offers modern smart classrooms, high-speed fiber Wi-Fi, and advanced computational labs.",
            "suggestions": [
                "📞 Contact Admissions Office",
                "📅 Schedule Campus Visit",
                "📝 Submit Admission Form"
            ]
        }

    # 10. Documents Required
    if any(k in msg for k in ["document", "upload", "marksheet", "certificate", "paperwork"]):
        docs = "\n".join([f"{i+1}. {d}" for i, d in enumerate(kb["admissions"]["documents_required"])])
        return {
            "reply": f"📑 **Checklist of Required Admission Documents:**\n\n{docs}",
            "suggestions": [
                "📝 Submit Online Enquiry",
                "📅 Key Dates",
                "📞 Admission Helpline"
            ]
        }

    # 11. Contact Info
    if any(k in msg for k in ["contact", "phone", "email", "address", "call", "reach", "help"]):
        ct = kb["university"]["contact"]
        u = kb["university"]
        return {
            "reply": f"📞 **R.V Institute of Technology and Management (RVITM):**\n\n- **Campus Address**: {u['location']}\n- **Admission Email**: [{ct['admission_email']}](mailto:{ct['admission_email']})\n- **Admission Helplines**: **{ct['phone']}**\n- **WhatsApp Inquiry Desk**: **{ct['whatsapp']}**\n- **Office Hours**: {ct['office_hours']}\n\nYou can also submit the enquiry form on our portal to have an admission counselor contact you directly!",
            "suggestions": [
                "📝 Fill Enquiry Form",
                "🎓 Explore Programs",
                "🚀 Placement Records"
            ]
        }

    # 12. Default Fallback
    return {
        "reply": f"Thank you for reaching out! **R.V Institute of Technology and Management (RVITM)** is one of Bengaluru's premier engineering institutions under RSST, known for its **98.2% placement record**, high-tech computing labs, and industry mentorship.\n\nHow can I help guide your admission journey today?",
        "suggestions": [
            "🎓 B.E. Programs (CSE, AI, ISE, ECE)",
            "💰 Fee Structure & Scholarships",
            "🎯 KCET & COMEDK Cutoffs",
            "📝 Submit Admission Enquiry"
        ]
    }

# Routes
@app.route("/")
def index():
    return render_template(
        "index.html",
        university=kb.get("university", {}),
        programs=kb.get("programs", []),
        scholarships=kb.get("scholarships", []),
        deadlines=kb.get("admissions", {}).get("deadlines", [])
    )

@app.route("/chat")
def chat_page():
    """Dedicated AI Admission Chatbot Page requiring email before querying."""
    return render_template(
        "chat_page.html",
        university=kb.get("university", {}),
        programs=kb.get("programs", [])
    )

@app.route("/api/register-visitor", methods=["POST"])
def register_visitor():
    """Registers visitor email and profile before granting chatbot query access."""
    data = request.get_json(force=True, silent=True) or {}
    email = (data.get("email") or "").strip()
    name = (data.get("name") or "Prospective Student").strip()
    branch = (data.get("branch") or "").strip()

    if not email:
        return jsonify({"success": False, "message": "Email ID is required to begin consultation."}), 400
    
    if not validate_email(email):
        return jsonify({"success": False, "message": "Please enter a valid email address (e.g. yourname@domain.com)."}), 400

    visitor_record = {
        "email": email,
        "name": name,
        "branch_interest": branch,
        "registered_at": datetime.datetime.now().isoformat(),
        "source": "AI Chatbot Gateway"
    }

    try:
        visitors = []
        if os.path.exists(VISITORS_PATH):
            with open(VISITORS_PATH, "r", encoding="utf-8-sig") as f:
                visitors = json.load(f)
        
        # Check if email already recorded, update or append
        existing = next((v for v in visitors if v.get("email", "").lower() == email.lower()), None)
        if existing:
            existing["last_active"] = datetime.datetime.now().isoformat()
            if branch:
                existing["branch_interest"] = branch
        else:
            visitors.append(visitor_record)

        with open(VISITORS_PATH, "w", encoding="utf-8") as f:
            json.dump(visitors, f, indent=2)

    except Exception as e:
        print(f"Error saving visitor: {e}")

    return jsonify({
        "success": True,
        "email": email,
        "name": name,
        "message": f"Welcome, {name}! Your consultation session is activated for {email}."
    })

@app.route("/api/programs", methods=["GET"])
def get_programs():
    return jsonify({"success": True, "programs": kb.get("programs", [])})

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True, silent=True) or {}
    message = data.get("message", "").strip()
    history = data.get("history", [])
    user_email = (data.get("email") or "").strip()
    user_name = (data.get("name") or "").strip()

    # Enforce email requirement: user must provide a valid email to query the chatbot
    if not user_email:
        return jsonify({
            "success": False,
            "requires_email": True,
            "error": "Email address is required before querying the AI Admission Advisor.",
            "reply": "⚠️ **Email Verification Required:** Please provide your email address to unlock AI Admission Consultation."
        }), 401

    if not validate_email(user_email):
        return jsonify({
            "success": False,
            "requires_email": True,
            "error": "Please provide a valid email address.",
            "reply": "⚠️ Please provide a valid email address (e.g. name@domain.com) to continue."
        }), 400

    if not message:
        return jsonify({"success": False, "error": "Message cannot be empty."}), 400

    response_data = generate_ai_response(message, history, user_email, user_name)
    return jsonify({
        "success": True,
        "reply": response_data.get("reply", ""),
        "suggestions": response_data.get("suggestions", []),
        "action": response_data.get("action", None),
        "user_email": user_email,
        "timestamp": datetime.datetime.now().isoformat()
    })

@app.route("/api/enquiry", methods=["POST"])
def submit_enquiry():
    data = request.get_json(force=True, silent=True) or {}
    
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    phone = (data.get("phone") or "").strip()
    program = (data.get("program") or "").strip()
    intake = (data.get("intake") or "Academic Year 2026-2027").strip()
    message = (data.get("message") or "").strip()
    gpa = (data.get("gpa") or "").strip()

    # Validation
    errors = []
    if not name or len(name) < 2:
        errors.append("Please provide your full legal name.")
    
    if not email:
        errors.append("Email address is required.")
    elif not validate_email(email):
        errors.append("Please provide a valid email address (e.g. yourname@domain.com).")

    if not program:
        errors.append("Please select a program of interest.")

    if errors:
        return jsonify({"success": False, "errors": errors, "message": " ".join(errors)}), 400

    reference_id = f"RVITM-2026-{uuid.uuid4().hex[:6].upper()}"
    new_enquiry = {
        "reference_id": reference_id,
        "name": name,
        "email": email,
        "phone": phone,
        "program": program,
        "intake": intake,
        "gpa": gpa,
        "message": message,
        "submitted_at": datetime.datetime.now().isoformat(),
        "status": "Under Counselor Review"
    }

    try:
        enquiries = []
        if os.path.exists(ENQUIRIES_PATH):
            with open(ENQUIRIES_PATH, "r", encoding="utf-8-sig") as f:
                enquiries = json.load(f)
        
        enquiries.append(new_enquiry)
        
        with open(ENQUIRIES_PATH, "w", encoding="utf-8") as f:
            json.dump(enquiries, f, indent=2)
            
    except Exception as e:
        print(f"Error persisting enquiry: {e}")
        return jsonify({"success": False, "message": "Failed to save enquiry. Please try again."}), 500

    return jsonify({
        "success": True,
        "reference_id": reference_id,
        "name": name,
        "email": email,
        "program": program,
        "intake": intake,
        "department_contact": {
            "department": f"Department of {program}",
            "email": "admissions@rvitm.edu.in",
            "phone": "+91 80 6813 6555 / +91 94808 49494",
            "office": "Admissions & Student Affairs Cell, RVITM Campus, JP Nagar 8th Phase, Bengaluru",
            "hours": "Monday - Saturday: 9:00 AM - 5:30 PM IST"
        },
        "message": f"Thank you, {name}! Your admission enquiry has been successfully registered under Reference #{reference_id}. For any further enquiries or seat allotment updates, please contact the department directly at admissions@rvitm.edu.in or call +91 80 6813 6555 / +91 94808 49494.",
        "brochure_download": "/static/RVITM_Admissions_Prospectus_2026.pdf"
    })

@app.route("/api/enquiries", methods=["GET"])
def list_enquiries():
    try:
        with open(ENQUIRIES_PATH, "r", encoding="utf-8-sig") as f:
            enquiries = json.load(f)
        return jsonify({"success": True, "count": len(enquiries), "enquiries": enquiries})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/visitors", methods=["GET"])
def list_visitors():
    try:
        with open(VISITORS_PATH, "r", encoding="utf-8-sig") as f:
            visitors = json.load(f)
        return jsonify({"success": True, "count": len(visitors), "visitors": visitors})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
