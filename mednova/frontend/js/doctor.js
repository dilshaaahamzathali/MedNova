/**
 * MedNova Doctor Portal Controller
 * Handles Doctor Verified Profile, Consultation Inbox, Case Response Modal, and Article Publishing.
 */

window.MedNovaDoctor = {
  activeCaseId: null,

  init() {
    this.bindDoctorEvents();
  },

  bindDoctorEvents() {
    // Doctor Sidebar Menu
    document.querySelectorAll('#doctor-sidebar-menu .menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const viewId = e.currentTarget.dataset.docView;
        this.switchDoctorTab(viewId);
      });
    });

    // Consultation Inbox Filter Buttons
    document.querySelectorAll('.inbox-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.inbox-filter-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const filter = e.currentTarget.dataset.filter;
        this.renderConsultationInbox(filter);
      });
    });

    // Form Submit for Medical Advice Response
    const adviceForm = document.getElementById('form-doctor-advice');
    if (adviceForm) {
      adviceForm.addEventListener('submit', (e) => this.handleAdviceSubmit(e));
    }

    // Form Submit for New Health Article
    const articleForm = document.getElementById('form-create-article');
    if (articleForm) {
      articleForm.addEventListener('submit', (e) => this.handleArticleSubmit(e));
    }
  },

  switchDoctorTab(viewId = 'inbox') {
    document.querySelectorAll('#doctor-sidebar-menu .menu-item').forEach(i => i.classList.remove('active'));
    const activeItem = document.querySelector(`#doctor-sidebar-menu .menu-item[data-doc-view="${viewId}"]`);
    if (activeItem) activeItem.classList.add('active');

    const views = ['doc-view-inbox', 'doc-view-articles', 'doc-view-profile'];
    views.forEach(v => {
      const el = document.getElementById(v);
      if (el) el.classList.add('hidden');
    });

    const targetEl = document.getElementById(`doc-view-${viewId}`);
    if (targetEl) targetEl.classList.remove('hidden');

    if (viewId === 'inbox') this.renderConsultationInbox('ALL');
    else if (viewId === 'articles') this.renderDoctorArticles();
    else if (viewId === 'profile') this.renderProfile();
  },

  render() {
    this.switchDoctorTab('inbox');
    this.renderDoctorHeaderProfile();
    this.renderConsultationInbox('ALL');
    this.renderDoctorArticles();
    this.renderProfile();
  },

  renderDoctorHeaderProfile() {
    const user = MedNovaData.currentUser;
    const profileBanner = document.getElementById('doc-profile-banner');
    if (!profileBanner) return;

    profileBanner.innerHTML = `
      <div class="glass-card p-4" style="background: linear-gradient(135deg, rgba(204, 251, 241, 0.4) 0%, rgba(219, 234, 254, 0.4) 100%); display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 1.25rem;">
          <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--primary-gradient); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; box-shadow: var(--shadow-glow);">
            ${user.avatar || 'DR'}
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <h2 style="font-size: 1.35rem;">${user.name}</h2>
              <span class="badge badge-${user.status === 'VERIFIED' ? 'verified' : 'pending'}">
                <i class="fa-solid ${user.status === 'VERIFIED' ? 'fa-user-check' : 'fa-clock'}"></i>
                ${user.status === 'VERIFIED' ? 'VERIFIED DOCTOR' : 'PENDING VERIFICATION'}
              </span>
            </div>
            <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.25rem;">
              Specialization: <strong>${user.specialization || 'Cardiology'}</strong> • Account Role: Verified Medical Practitioner
            </div>
          </div>
        </div>
        <div>
          <button class="btn btn-primary" onclick="MedNovaApp.openModal('modal-new-article')">
            <i class="fa-solid fa-pen-nib"></i> Publish Health Article
          </button>
        </div>
      </div>
    `;
  },

  renderConsultationInbox(filter = 'ALL') {
    const container = document.getElementById('consultations-inbox-grid');
    if (!container) return;

    let cases = MedNovaData.consultations;
    if (filter === 'NEW') cases = cases.filter(c => c.status === 'NEW');
    else if (filter === 'IN_REVIEW') cases = cases.filter(c => c.status === 'IN_REVIEW');
    else if (filter === 'RESOLVED') cases = cases.filter(c => c.status === 'RESOLVED');

    if (cases.length === 0) {
      container.innerHTML = `<div class="glass-card p-4" style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">No consultation requests in this inbox category.</div>`;
      return;
    }

    container.innerHTML = cases.map(c => `
      <div class="glass-card case-card">
        <div class="case-header">
          <span class="case-id"><i class="fa-solid fa-shield-halved text-teal"></i> ${c.id}</span>
          <span class="badge badge-${c.status === 'RESOLVED' ? 'resolved' : (c.status === 'NEW' ? 'new' : 'pending')}">${c.status}</span>
        </div>
        <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.4rem;">
          Identity: <span style="font-family: monospace; color: var(--text-main); font-weight: 500;">${c.anonymousHash}</span>
        </div>
        <div class="case-symptoms">
          ${c.symptoms.map(s => `<span class="symptom-tag"><i class="fa-solid fa-notes-medical"></i> ${s}</span>`).join('')}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
          <div>
            <span class="badge badge-${c.aiRiskScore === 'HIGH_RISK' ? 'rejected' : (c.aiRiskScore === 'MODERATE_RISK' ? 'pending' : 'verified')}">
              AI Risk: ${c.aiRiskScore.replace('_', ' ')} (${c.aiConfidence})
            </span>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="MedNovaDoctor.openCaseModal('${c.id}')">
            ${c.status === 'RESOLVED' ? '<i class="fa-solid fa-eye"></i> View Advice' : '<i class="fa-solid fa-stethoscope"></i> Review & Respond'}
          </button>
        </div>
      </div>
    `).join('');
  },

  openCaseModal(caseId) {
    const caseData = MedNovaData.consultations.find(c => c.id === caseId);
    if (!caseData) return;

    this.activeCaseId = caseId;
    document.getElementById('modal-case-id').innerText = caseData.id;
    document.getElementById('modal-case-hash').innerText = caseData.anonymousHash;
    document.getElementById('modal-case-risk').innerText = `AI Risk Assessment: ${caseData.aiRiskScore.replace('_', ' ')} (${caseData.aiConfidence})`;
    
    // Symptoms list
    document.getElementById('modal-case-symptoms-list').innerHTML = caseData.symptoms.map(s => `<li>${s}</li>`).join('');
    document.getElementById('modal-case-duration').innerText = caseData.duration;

    const adviceTextarea = document.getElementById('doctor-advice-input');
    const existingAdviceBox = document.getElementById('modal-existing-advice');

    if (caseData.status === 'RESOLVED') {
      adviceTextarea.value = caseData.doctorAdvice || '';
      adviceTextarea.disabled = true;
      document.getElementById('btn-submit-advice').classList.add('hidden');
      if (existingAdviceBox) {
        existingAdviceBox.innerText = `Previously Sent Advice: ${caseData.doctorAdvice}`;
        existingAdviceBox.classList.remove('hidden');
      }
    } else {
      adviceTextarea.value = '';
      adviceTextarea.disabled = false;
      document.getElementById('btn-submit-advice').classList.remove('hidden');
      if (existingAdviceBox) existingAdviceBox.classList.add('hidden');
    }

    MedNovaApp.openModal('modal-case-detail');
  },

  handleAdviceSubmit(e) {
    e.preventDefault();
    if (!this.activeCaseId) return;

    const advice = document.getElementById('doctor-advice-input').value.trim();
    if (!advice) {
      MedNovaApp.showToast('Please enter your clinical advice for the patient.', 'error');
      return;
    }

    const c = MedNovaData.consultations.find(item => item.id === this.activeCaseId);
    if (c) {
      c.status = 'RESOLVED';
      c.doctorAdvice = advice;
      c.assignedDoctorId = MedNovaData.currentUser.id;

      // Audit Log
      MedNovaData.auditLogs.unshift({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        eventType: 'DOCTOR_CONSULTATION_RESOLVED',
        actor: MedNovaData.currentUser.email,
        description: `Clinical advice provided for anonymous case ${c.id}. Response payload encrypted with AES-256.`
      });

      MedNovaApp.closeModal('modal-case-detail');
      MedNovaApp.showToast(`Clinical response sent for case ${c.id}! Marked as RESOLVED.`, 'success');
      this.render();
    }
  },

  renderDoctorArticles() {
    const container = document.getElementById('doctor-articles-grid');
    if (!container) return;

    const myArticles = MedNovaData.articles.filter(a => a.authorId === MedNovaData.currentUser.id || a.authorName.includes(MedNovaData.currentUser.name));
    
    if (myArticles.length === 0) {
      container.innerHTML = `<div class="glass-card p-4" style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">You have not published any health awareness articles yet. Click "Publish Health Article" to share trusted medical advice!</div>`;
      return;
    }

    container.innerHTML = myArticles.map(art => `
      <div class="glass-card p-4">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <span class="badge badge-${art.status === 'APPROVED' ? 'verified' : 'pending'}">${art.status}</span>
          <span style="font-size: 0.8rem; color: var(--text-muted);">${art.publishedDate}</span>
        </div>
        <h3 style="font-size: 1.1rem; margin-bottom: 0.4rem;">${art.title}</h3>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">${art.summary}</p>
        <div style="font-size: 0.8rem; color: var(--primary); font-weight: 600;">Category: ${art.category}</div>
      </div>
    `).join('');
  },

  handleArticleSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('art-title').value.trim();
    const cat = document.getElementById('art-category').value;
    const summary = document.getElementById('art-summary').value.trim();
    const content = document.getElementById('art-content').value.trim();

    if (!title || !summary || !content) {
      MedNovaApp.showToast('Please complete all article fields.', 'error');
      return;
    }

    const newArt = {
      id: `art_${Date.now()}`,
      title: title,
      category: cat,
      authorId: MedNovaData.currentUser.id,
      authorName: MedNovaData.currentUser.name,
      status: 'PENDING_MODERATION',
      publishedDate: new Date().toISOString().split('T')[0],
      summary: summary,
      content: content
    };

    MedNovaData.articles.unshift(newArt);

    MedNovaApp.closeModal('modal-new-article');
    document.getElementById('form-create-article').reset();
    MedNovaApp.showToast(`Article "${title}" submitted to Admin queue for moderation!`, 'success');
    this.render();
  },

  renderProfile() {
    const user = MedNovaData.currentUser;
    const doc = MedNovaData.doctors.find(d => d.id === user.id) || MedNovaData.doctors[0];

    const container = document.getElementById('doc-profile-details');
    if (!container) return;

    container.innerHTML = `
      <div class="glass-card p-4">
        <h3 style="margin-bottom: 1rem;">Verified Doctor Credentials</h3>
        <div class="grid-2">
          <div>
            <div style="color: var(--text-muted); font-size: 0.85rem;">Full Name & Degree</div>
            <div style="font-weight: 600; font-size: 1.05rem; margin-bottom: 0.75rem;">${doc.name}</div>

            <div style="color: var(--text-muted); font-size: 0.85rem;">Specialization</div>
            <div style="font-weight: 600; font-size: 1.05rem; margin-bottom: 0.75rem;">${doc.specialization}</div>

            <div style="color: var(--text-muted); font-size: 0.85rem;">Hospital / Clinic Affiliation</div>
            <div style="font-weight: 600; font-size: 1.05rem; margin-bottom: 0.75rem;">${doc.hospital}</div>
          </div>
          <div>
            <div style="color: var(--text-muted); font-size: 0.85rem;">Medical License Number</div>
            <div style="font-weight: 600; font-size: 1.05rem; font-family: monospace; color: var(--accent); margin-bottom: 0.75rem;">${doc.licenseNumber}</div>

            <div style="color: var(--text-muted); font-size: 0.85rem;">Issuing Council / Board</div>
            <div style="font-weight: 600; font-size: 1.05rem; margin-bottom: 0.75rem;">${doc.council}</div>

            <div style="color: var(--text-muted); font-size: 0.85rem;">Verification Status</div>
            <div>
              <span class="badge badge-${doc.status === 'VERIFIED' ? 'verified' : 'pending'}">
                <i class="fa-solid fa-certificate"></i> ${doc.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};
