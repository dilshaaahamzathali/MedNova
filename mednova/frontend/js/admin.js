/**
 * MedNova Admin Portal Controller
 * Controls Verification Queue, Analytics, User Management, Article Moderation, and Security Logs.
 */

window.MedNovaAdmin = {
  init() {
    this.bindAdminEvents();
  },

  bindAdminEvents() {
    // Admin Sub-menu navigation
    document.querySelectorAll('#admin-sidebar-menu .menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const targetView = e.currentTarget.dataset.adminView;
        this.switchAdminTab(targetView);
      });
    });

    // Verification Queue Filter Buttons
    document.querySelectorAll('.verify-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.verify-filter-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const filter = e.currentTarget.dataset.filter;
        this.renderVerificationQueue(filter);
      });
    });

    // Doctor Search input
    const docSearch = document.getElementById('admin-doc-search');
    if (docSearch) {
      docSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        this.renderDoctorDirectory(query);
      });
    }
  },

  switchAdminTab(viewId = 'dashboard') {
    document.querySelectorAll('#admin-sidebar-menu .menu-item').forEach(i => i.classList.remove('active'));
    const activeItem = document.querySelector(`#admin-sidebar-menu .menu-item[data-admin-view="${viewId}"]`);
    if (activeItem) activeItem.classList.add('active');

    // Toggle Admin Views
    const views = ['admin-view-dashboard', 'admin-view-verification', 'admin-view-doctors', 'admin-view-articles', 'admin-view-logs'];
    views.forEach(v => {
      const el = document.getElementById(v);
      if (el) el.classList.add('hidden');
    });

    const targetEl = document.getElementById(`admin-view-${viewId}`);
    if (targetEl) targetEl.classList.remove('hidden');

    // Render corresponding section data
    if (viewId === 'dashboard') this.renderDashboard();
    else if (viewId === 'verification') this.renderVerificationQueue('ALL');
    else if (viewId === 'doctors') this.renderDoctorDirectory('');
    else if (viewId === 'articles') this.renderArticleModeration();
    else if (viewId === 'logs') this.renderAuditLogs();
  },

  render() {
    this.switchAdminTab('dashboard');
    this.renderDashboard();
    this.renderVerificationQueue('ALL');
    this.renderDoctorDirectory('');
    this.renderArticleModeration();
    this.renderAuditLogs();
  },

  renderDashboard() {
    const doctors = MedNovaData.doctors;
    const verifiedCount = doctors.filter(d => d.status === 'VERIFIED').length;
    const pendingCount = doctors.filter(d => d.status === 'PENDING_VERIFICATION').length;
    const resolvedCases = MedNovaData.consultations.filter(c => c.status === 'RESOLVED').length;
    const totalArticles = MedNovaData.articles.filter(a => a.status === 'APPROVED').length;

    const vElem = document.getElementById('stat-verified-doctors');
    const pElem = document.getElementById('stat-pending-doctors');
    const rElem = document.getElementById('stat-resolved-cases');
    const aElem = document.getElementById('stat-published-articles');

    if (vElem) vElem.innerText = verifiedCount;
    if (pElem) pElem.innerText = pendingCount;
    if (rElem) rElem.innerText = resolvedCases;
    if (aElem) aElem.innerText = totalArticles;

    // Update menu badge for pending verifications
    const pendingBadge = document.getElementById('admin-pending-badge');
    if (pendingBadge) {
      if (pendingCount > 0) {
        pendingBadge.innerText = pendingCount;
        pendingBadge.classList.remove('hidden');
      } else {
        pendingBadge.classList.add('hidden');
      }
    }

    // Render Recent Verification Feed widget
    const recentFeed = document.getElementById('widget-recent-verifications');
    if (recentFeed) {
      const recentDocs = [...doctors].slice(0, 4);
      recentFeed.innerHTML = recentDocs.map(doc => `
        <div style="padding: 0.85rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 600;">${doc.name}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${doc.specialization} • License #${doc.licenseNumber}</div>
          </div>
          <div>
            <span class="badge badge-${doc.status.toLowerCase().includes('pending') ? 'pending' : (doc.status.toLowerCase().includes('verified') ? 'verified' : 'rejected')}">
              ${doc.status}
            </span>
          </div>
        </div>
      `).join('');
    }
  },

  renderVerificationQueue(filter = 'ALL') {
    const tbody = document.getElementById('table-verification-body');
    if (!tbody) return;

    let list = MedNovaData.doctors;
    if (filter === 'PENDING') list = list.filter(d => d.status === 'PENDING_VERIFICATION');
    else if (filter === 'VERIFIED') list = list.filter(d => d.status === 'VERIFIED');
    else if (filter === 'REJECTED') list = list.filter(d => d.status === 'REJECTED');

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No doctor verification requests match this filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(doc => `
      <tr id="row-doc-${doc.id}">
        <td>
          <div style="font-weight: 600; color: var(--text-main);">${doc.name}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${doc.email}</div>
        </td>
        <td>
          <div style="font-weight: 500;">${doc.specialization}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${doc.hospital}</div>
        </td>
        <td>
          <span style="font-family: monospace; font-weight: 600; color: var(--accent);">${doc.licenseNumber}</span>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${doc.council}</div>
        </td>
        <td>
          <a href="#" onclick="event.preventDefault(); MedNovaApp.showToast('Viewing verified credential document: ${doc.documentUrl}', 'info');" style="font-size: 0.85rem; font-weight: 500;">
            <i class="fa-solid fa-file-pdf"></i> ${doc.documentUrl}
          </a>
        </td>
        <td>
          <span class="badge badge-${doc.status === 'VERIFIED' ? 'verified' : (doc.status === 'PENDING_VERIFICATION' ? 'pending' : 'rejected')}">
            <i class="fa-solid ${doc.status === 'VERIFIED' ? 'fa-certificate' : (doc.status === 'PENDING_VERIFICATION' ? 'fa-clock' : 'fa-xmark')}"></i>
            ${doc.status}
          </span>
        </td>
        <td>
          ${doc.status === 'PENDING_VERIFICATION' ? `
            <div style="display: flex; gap: 0.4rem;">
              <button class="btn btn-success btn-sm" onclick="MedNovaAdmin.approveDoctor('${doc.id}')">
                <i class="fa-solid fa-check"></i> Approve
              </button>
              <button class="btn btn-danger btn-sm" onclick="MedNovaAdmin.rejectDoctor('${doc.id}')">
                <i class="fa-solid fa-xmark"></i> Reject
              </button>
            </div>
          ` : `
            <span style="font-size: 0.8rem; color: var(--text-muted);">
              ${doc.verifiedDate ? `Verified on ${doc.verifiedDate}` : 'Processed'}
            </span>
          `}
        </td>
      </tr>
    `).join('');
  },

  approveDoctor(doctorId) {
    const doc = MedNovaData.doctors.find(d => d.id === doctorId);
    if (!doc) return;

    doc.status = 'VERIFIED';
    doc.verifiedDate = new Date().toISOString().split('T')[0];

    // Log Audit Event
    MedNovaData.auditLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      eventType: 'ADMIN_DOCTOR_APPROVAL',
      actor: MedNovaData.currentUser.email,
      description: `Approved doctor verification for ${doc.name} (License #${doc.licenseNumber}). Verified Badge & Digital Signature issued.`
    });

    MedNovaApp.showToast(`Doctor ${doc.name} has been VERIFIED! Digital Badge issued.`, 'success');
    this.render();
  },

  rejectDoctor(doctorId) {
    const doc = MedNovaData.doctors.find(d => d.id === doctorId);
    if (!doc) return;

    doc.status = 'REJECTED';

    MedNovaData.auditLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      eventType: 'ADMIN_DOCTOR_REJECTION',
      actor: MedNovaData.currentUser.email,
      description: `Rejected doctor verification application for ${doc.name} (License #${doc.licenseNumber}).`
    });

    MedNovaApp.showToast(`Doctor registration for ${doc.name} set to REJECTED.`, 'info');
    this.render();
  },

  renderDoctorDirectory(searchQuery = '') {
    const tbody = document.getElementById('table-doctors-directory-body');
    if (!tbody) return;

    let list = MedNovaData.doctors;
    if (searchQuery) {
      list = list.filter(d => 
        d.name.toLowerCase().includes(searchQuery) ||
        d.specialization.toLowerCase().includes(searchQuery) ||
        d.licenseNumber.toLowerCase().includes(searchQuery)
      );
    }

    tbody.innerHTML = list.map(doc => `
      <tr>
        <td>
          <div style="font-weight: 600;">${doc.name}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${doc.email}</div>
        </td>
        <td><span class="symptom-tag">${doc.specialization}</span></td>
        <td>${doc.hospital}</td>
        <td><span style="font-family: monospace;">${doc.licenseNumber}</span></td>
        <td>${doc.experienceYears} Years</td>
        <td>
          <span class="badge badge-${doc.status === 'VERIFIED' ? 'verified' : (doc.status === 'PENDING_VERIFICATION' ? 'pending' : 'rejected')}">
            ${doc.status}
          </span>
        </td>
      </tr>
    `).join('');
  },

  renderArticleModeration() {
    const container = document.getElementById('articles-moderation-grid');
    if (!container) return;

    const articles = MedNovaData.articles;
    container.innerHTML = articles.map(art => `
      <div class="glass-card p-4">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <span class="badge badge-${art.status === 'APPROVED' ? 'verified' : 'pending'}">${art.status}</span>
          <span style="font-size: 0.8rem; color: var(--text-muted);">${art.publishedDate}</span>
        </div>
        <h3 style="font-size: 1.1rem; margin-bottom: 0.4rem;">${art.title}</h3>
        <div style="font-size: 0.85rem; color: var(--primary); font-weight: 600; margin-bottom: 0.5rem;">
          By ${art.authorName} • <span class="symptom-tag">${art.category}</span>
        </div>
        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem;">${art.summary}</p>
        <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
          ${art.status === 'PENDING_MODERATION' ? `
            <button class="btn btn-success btn-sm" onclick="MedNovaAdmin.approveArticle('${art.id}')">
              <i class="fa-solid fa-check"></i> Approve & Publish
            </button>
          ` : `
            <button class="btn btn-secondary btn-sm" onclick="MedNovaAdmin.unpublishArticle('${art.id}')">
              Unpublish
            </button>
          `}
        </div>
      </div>
    `).join('');
  },

  approveArticle(articleId) {
    const art = MedNovaData.articles.find(a => a.id === articleId);
    if (art) {
      art.status = 'APPROVED';
      MedNovaApp.showToast(`Article "${art.title}" approved and published to Health Hub!`, 'success');
      this.render();
    }
  },

  unpublishArticle(articleId) {
    const art = MedNovaData.articles.find(a => a.id === articleId);
    if (art) {
      art.status = 'PENDING_MODERATION';
      MedNovaApp.showToast(`Article "${art.title}" unpublished.`, 'info');
      this.render();
    }
  },

  renderAuditLogs() {
    const container = document.getElementById('audit-logs-list');
    if (!container) return;

    container.innerHTML = MedNovaData.auditLogs.map(log => `
      <div style="padding: 0.9rem 1.2rem; border-bottom: 1px solid var(--border-color); display: flex; gap: 1rem; align-items: flex-start;">
        <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 0.9rem; flex-shrink: 0; margin-top: 0.2rem;">
          <i class="fa-solid fa-shield-halved"></i>
        </div>
        <div style="flex-grow: 1;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem;">
            <span style="font-weight: 600; font-size: 0.88rem; color: var(--text-main);">${log.eventType}</span>
            <span style="font-size: 0.78rem; font-family: monospace; color: var(--text-muted);">${log.timestamp}</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.2rem;">${log.description}</p>
          <div style="font-size: 0.75rem; color: var(--primary); font-weight: 500;">Actor: ${log.actor}</div>
        </div>
      </div>
    `).join('');
  }
};
