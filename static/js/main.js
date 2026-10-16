/**
 * Elara University Admissions - Landing Page Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initProgramFilters();
  initEnquiryForm();
  initFaqAccordion();
  initSmoothScroll();
});

/* Countdown Timer for Early Action Deadline */
function initCountdown() {
  const daysEl = document.getElementById('count-days');
  const hoursEl = document.getElementById('count-hours');
  const minsEl = document.getElementById('count-mins');
  const secsEl = document.getElementById('count-secs');

  if (!daysEl) return;

  // Set target deadline: 30 days from now or Nov 15, 2026
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 28);
  targetDate.setHours(23, 59, 59, 0);

  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    if (distance < 0) {
      daysEl.innerText = '00';
      hoursEl.innerText = '00';
      minsEl.innerText = '00';
      secsEl.innerText = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.innerText = String(days).padStart(2, '0');
    hoursEl.innerText = String(hours).padStart(2, '0');
    minsEl.innerText = String(minutes).padStart(2, '0');
    secsEl.innerText = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* Program Filter Buttons */
function initProgramFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.program-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const level = card.getAttribute('data-level');
        if (filter === 'all' || level === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* Admission Enquiry Form Handling */
function initEnquiryForm() {
  const form = document.getElementById('admission-enquiry-form');
  const alertBox = document.getElementById('form-alert');
  const submitBtn = document.getElementById('enquiry-submit-btn');

  if (!form) return;

  // Select program from external click (e.g. Program card "Enquire" button)
  window.selectProgramInForm = function(programName) {
    const progSelect = document.getElementById('enquiry-program');
    if (progSelect) {
      for (let i = 0; i < progSelect.options.length; i++) {
        if (progSelect.options[i].text.includes(programName) || progSelect.options[i].value.includes(programName)) {
          progSelect.selectedIndex = i;
          break;
        }
      }
    }
    const enquirySec = document.getElementById('enquiry-section');
    if (enquirySec) {
      enquirySec.scrollIntoView({ behavior: 'smooth' });
      // highlight input
      if (progSelect) {
        progSelect.focus();
        progSelect.style.borderColor = '#38bdf8';
        setTimeout(() => { progSelect.style.borderColor = ''; }, 2000);
      }
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    alertBox.className = 'form-alert';
    alertBox.style.display = 'none';
    alertBox.innerHTML = '';

    const name = document.getElementById('enquiry-name').value.trim();
    const email = document.getElementById('enquiry-email').value.trim();
    const phone = document.getElementById('enquiry-phone').value.trim();
    const program = document.getElementById('enquiry-program').value;
    const intake = document.getElementById('enquiry-intake').value;
    const gpa = document.getElementById('enquiry-gpa').value.trim();
    const message = document.getElementById('enquiry-message').value.trim();

    // Client-side validation
    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!name) {
      showFormAlert('Please enter your full legal name.', 'error');
      return;
    }
    if (!email) {
      showFormAlert('Email address is required so we can send your admission syllabus and prospectus.', 'error');
      return;
    }
    if (!emailRegex.test(email)) {
      showFormAlert('Please enter a valid email address (e.g. name@domain.com).', 'error');
      return;
    }
    if (!program) {
      showFormAlert('Please select your preferred degree program.', 'error');
      return;
    }

    // Submit state
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spin" style="width:18px;height:18px;animation:spin 1s linear infinite;" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10" stroke-width="4" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-width="4"></path>
      </svg>
      Submitting Enquiry...
    `;

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, program, intake, gpa, message })
      });

      const data = await res.json();

      if (data.success) {
        const dept = data.department_contact || {
          department: `Department of ${data.program}`,
          email: "admissions@rvitm.edu.in",
          phone: "+91 80 6813 6555 / +91 94808 49494",
          office: "Admissions & Student Affairs Cell, RVITM Campus, JP Nagar 8th Phase, Bengaluru",
          hours: "Monday - Saturday: 9:00 AM - 5:30 PM IST"
        };

        // Render On-Screen Result & Receipt
        alertBox.className = 'form-alert success';
        alertBox.style.display = 'block';
        alertBox.innerHTML = `
          <div style="display:flex;flex-direction:column;gap:14px;padding:4px 0;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:38px;height:38px;border-radius:50%;background:rgba(16,185,129,0.25);border:1px solid #10b981;display:flex;align-items:center;justify-content:center;color:#10b981;flex-shrink:0;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <div>
                <h4 style="color:#fff;font-size:1.15rem;font-weight:800;margin:0;line-height:1.2;">Admission Enquiry Confirmed</h4>
                <span style="color:#34d399;font-size:0.8rem;font-weight:600;">Official Registration Acknowledged</span>
              </div>
            </div>

            <!-- Summary Box -->
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:14px;">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:0.85rem;">
                <div>
                  <span style="color:var(--text-muted);font-size:0.72rem;text-transform:uppercase;">Reference ID:</span>
                  <div style="color:var(--primary);font-family:var(--font-display);font-size:1.15rem;font-weight:800;">${data.reference_id}</div>
                </div>
                <div>
                  <span style="color:var(--text-muted);font-size:0.72rem;text-transform:uppercase;">Applicant Name:</span>
                  <div style="color:#fff;font-weight:700;">${data.name}</div>
                </div>
                <div>
                  <span style="color:var(--text-muted);font-size:0.72rem;text-transform:uppercase;">Registered Email:</span>
                  <div style="color:#cbd5e1;word-break:break-all;">${data.email}</div>
                </div>
                <div>
                  <span style="color:var(--text-muted);font-size:0.72rem;text-transform:uppercase;">Department:</span>
                  <div style="color:#fff;font-weight:600;">${data.program}</div>
                </div>
              </div>
            </div>

            <!-- For Further Enquiries, Contact the Department Notice -->
            <div style="background:rgba(56,189,248,0.1);border-left:4px solid var(--primary);border-radius:6px;padding:14px;">
              <h5 style="color:#fff;font-size:0.95rem;font-weight:700;margin-bottom:6px;display:flex;align-items:center;gap:6px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                For Further Enquiries, Please Contact the Department:
              </h5>
              <p style="color:#e2e8f0;font-size:0.84rem;line-height:1.5;margin:0 0 10px 0;">
                For seat allotment updates, cutoff clarifications, or direct admission counseling, please reach out to the department directly:
              </p>
              <div style="display:flex;flex-direction:column;gap:5px;font-size:0.84rem;">
                <div style="color:#fff;">🏛️ <strong>Department:</strong> ${dept.department}</div>
                <div>📧 <strong>Email:</strong> <a href="mailto:${dept.email}" style="color:var(--primary);text-decoration:underline;">${dept.email}</a></div>
                <div>📞 <strong>Helplines:</strong> <span style="color:#fff;">${dept.phone}</span></div>
                <div>📍 <strong>Campus Office:</strong> <span style="color:var(--text-secondary);">${dept.office}</span></div>
                <div>⏰ <strong>Office Hours:</strong> <span style="color:var(--text-secondary);">${dept.hours}</span></div>
              </div>
            </div>

            <!-- Action buttons -->
            <div style="display:flex;gap:10px;margin-top:4px;">
              <button type="button" class="btn btn-outline btn-sm" id="btn-submit-another" style="flex:1;">
                Submit Another Enquiry
              </button>
              <button type="button" class="btn btn-primary btn-sm" onclick="openAdmissionChat('I submitted enquiry #${data.reference_id}. What are the next admission steps?')" style="flex:1;">
                Ask AI About Status
              </button>
            </div>
          </div>
        `;

        // Hide form inputs while showing confirmation receipt
        const formGrid = form.querySelector('.form-grid');
        if (formGrid) formGrid.style.display = 'none';
        submitBtn.style.display = 'none';

        // Add listener to reset and show form again
        const resetBtn = document.getElementById('btn-submit-another');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            if (formGrid) formGrid.style.display = 'grid';
            submitBtn.style.display = 'block';
            alertBox.style.display = 'none';
            form.reset();
          });
        }

        // Also notify chatbot session of the prospective student's email
        const cb = window.RVITMChatbot || window.ElaraChatbot;
        if (cb) {
          cb.setUserEmail(email, name);
          cb.addSystemMessage(`Thank you for submitting your enquiry, ${name}! Your reference number is **${data.reference_id}**. For further enquiries, you can also contact the department at **admissions@rvitm.edu.in**.`);
        }

        showToast('Enquiry registered! Result displayed on screen.');
      } else {
        showFormAlert(data.message || 'Error submitting enquiry. Please check your inputs.', 'error');
      }
    } catch (err) {
      console.error(err);
      showFormAlert('Network error occurred. Please verify your connection and try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });

  function showFormAlert(html, type) {
    alertBox.innerHTML = html;
    alertBox.className = `form-alert ${type}`;
    alertBox.style.display = 'block';
  }
}

/* FAQ Accordion */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      items.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* Smooth Navigation Scroll */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* Toast System */
function showToast(message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast success';
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
