/**
 * MedNova Full-Featured Healthcare Platform Controller
 * Implements Complete DFD Level 1.1 (Admin), Level 1.2 (Patient), Level 1.3 (Doctor)
 * and Slide 13-16 Specifications.
 */

window.MedNova = {
  currentUser: {
    id: null,
    username: 'Guest',
    alias: 'Guest User',
    role: 'GUEST',
    doctor_id: null
  },
  currentCommunity: 'cardiology-heart-health',
  communities: [],
  doctors: [],
  lastAssessedSymptoms: '',

  init() {
    console.log("MedNova Healthcare Platform initialized.");
    this.fetchStats();
    this.fetchCommunities();
    this.fetchDoctors();
    this.checkSession();
  },

  checkSession() {
    const saved = localStorage.getItem('mednova_user');
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
        this.updateAuthUI();
      } catch (e) {
        localStorage.removeItem('mednova_user');
      }
    }
  },

  updateAuthUI() {
    const guestActions = document.getElementById('guest-actions');
    const userBadge = document.getElementById('user-badge');
    const userAlias = document.getElementById('user-display-alias');
    const userRole = document.getElementById('user-display-role');
    const navAdmin = document.getElementById('nav-admin-link');
    const navDoctor = document.getElementById('nav-doctor-link');
    const navMyConsult = document.getElementById('nav-my-consultations-link');

    if (this.currentUser && this.currentUser.role !== 'GUEST') {
      if (guestActions) guestActions.classList.add('hidden');
      if (userBadge) userBadge.classList.remove('hidden');
      if (userAlias) userAlias.textContent = this.currentUser.alias || this.currentUser.username;
      if (userRole) {
        userRole.textContent = this.currentUser.role;
        userRole.className = `badge ${this.currentUser.role === 'ADMIN' ? 'badge-blue' : this.currentUser.role === 'DOCTOR' ? 'badge-green' : 'badge-amber'}`;
      }
      
      if (navAdmin) {
        if (this.currentUser.role === 'ADMIN') navAdmin.classList.remove('hidden');
        else navAdmin.classList.add('hidden');
      }

      if (navDoctor) {
        if (this.currentUser.role === 'DOCTOR') navDoctor.classList.remove('hidden');
        else navDoctor.classList.add('hidden');
      }

      if (navMyConsult) {
        if (this.currentUser.role === 'PATIENT') navMyConsult.classList.remove('hidden');
        else navMyConsult.classList.add('hidden');
      }
    } else {
      if (guestActions) guestActions.classList.remove('hidden');
      if (userBadge) userBadge.classList.add('hidden');
      if (navAdmin) navAdmin.classList.add('hidden');
      if (navDoctor) navDoctor.classList.add('hidden');
      if (navMyConsult) navMyConsult.classList.add('hidden');
    }

    this.checkCommunitiesAccess();
  },

  checkCommunitiesAccess() {
    const lockedGate = document.getElementById('communities-locked-gate');
    const unlockedContent = document.getElementById('communities-unlocked-content');
    const doctorNotice = document.getElementById('gate-doctor-notice');
    const patientAliasEl = document.getElementById('community-patient-alias');

    // Disease support groups strictly restricted to registered patients (and admin)
    const isRegisteredPatient = this.currentUser && (this.currentUser.role === 'PATIENT' || this.currentUser.role === 'ADMIN');

    if (isRegisteredPatient) {
      if (lockedGate) lockedGate.classList.add('hidden');
      if (unlockedContent) unlockedContent.classList.remove('hidden');
      if (patientAliasEl) {
        patientAliasEl.innerHTML = `<i class="fa-solid fa-user-shield"></i> ${this.currentUser.alias || this.currentUser.username}`;
      }
      return true;
    } else {
      if (lockedGate) lockedGate.classList.remove('hidden');
      if (unlockedContent) unlockedContent.classList.add('hidden');
      if (doctorNotice) {
        if (this.currentUser && this.currentUser.role === 'DOCTOR') {
          doctorNotice.classList.remove('hidden');
        } else {
          doctorNotice.classList.add('hidden');
        }
      }
      return false;
    }
  },

  async fetchStats() {
    try {
      const res = await fetch('/api/stats/');
      const data = await res.json();
      if (data.status === 'success') {
        const s = data.stats;
        document.getElementById('stat-patients').textContent = `${s.patients_count}+`;
        document.getElementById('stat-doctors').textContent = `${s.verified_doctors_count}+`;
        document.getElementById('stat-consultations').textContent = `${s.consultations_count}+`;
        document.getElementById('stat-posts').textContent = `${s.community_posts_count}+`;
      }
    } catch (e) {
      console.warn('Could not fetch stats', e);
    }
  },

  async fetchDoctors() {
    try {
      const res = await fetch('/api/auth/doctors/');
      const data = await res.json();
      if (data.status === 'success') {
        this.doctors = data.doctors;
        this.renderDoctorsDirectory();
        this.populateConsultDoctorSelect();
      }
    } catch (e) {
      console.warn('Could not fetch doctors', e);
    }
  },

  populateConsultDoctorSelect() {
    const sel = document.getElementById('consult-doctor-select');
    if (!sel) return;
    sel.innerHTML = '<option value="any">-- Any Available Doctor --</option>';
    this.doctors.filter(d => d.status === 'VERIFIED').forEach(doc => {
      const opt = document.createElement('option');
      opt.value = doc.id;
      opt.textContent = `${doc.full_name} (${doc.specialization} - ${doc.hospital_affiliation})`;
      sel.appendChild(opt);
    });
  },

  renderDoctorsDirectory() {
    const container = document.getElementById('doctors-directory-grid');
    if (!container) return;
    container.innerHTML = '';

    this.doctors.forEach(doc => {
      const isVerified = doc.status === 'VERIFIED';
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.75rem;">
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <div style="width: 44px; height: 44px; border-radius: 50%; background: #eff6ff; color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
              <i class="fa-solid fa-user-doctor"></i>
            </div>
            <div>
              <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--text-main); margin: 0;">${doc.full_name}</h4>
              <div style="font-size: 0.82rem; color: var(--text-muted);">${doc.specialization}</div>
            </div>
          </div>
          <span class="badge ${isVerified ? 'badge-green' : 'badge-amber'}">
            ${isVerified ? '<i class="fa-solid fa-check-circle"></i> VERIFIED' : '<i class="fa-solid fa-clock"></i> PENDING'}
          </span>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-body); margin-bottom: 0.75rem;">${doc.bio || 'Consulting practitioner affiliated with verified clinical center.'}</p>
        <div style="font-size: 0.78rem; color: var(--text-muted); line-height: 1.6; border-top: 1px solid var(--border-color); padding-top: 0.6rem;">
          <div><i class="fa-solid fa-building-columns"></i> <strong>Hospital:</strong> ${doc.hospital_affiliation}</div>
          <div><i class="fa-solid fa-id-card"></i> <strong>License:</strong> ${doc.license_number}</div>
        </div>
        <div style="margin-top: 1rem;">
          <button class="btn btn-outline btn-sm" style="width: 100%;" onclick="MedNova.openConsultationWithDoctor('${doc.id}')">
            <i class="fa-solid fa-paper-plane"></i> Request Direct Consult
          </button>
        </div>
      `;
      container.appendChild(card);
    });
  },

  async fetchCommunities() {
    try {
      const headers = {
        'X-User-Id': this.currentUser?.id || '',
        'X-User-Role': this.currentUser?.role || ''
      };
      const res = await fetch('/api/communities/', { credentials: 'include', headers });
      const data = await res.json();
      if (data.status === 'success') {
        this.communities = data.communities;
        this.renderCommunitiesList();
        if (this.communities.length > 0 && this.currentUser && (this.currentUser.role === 'PATIENT' || this.currentUser.role === 'ADMIN')) {
          this.loadCommunityPosts(this.communities[0].slug);
        }
      }
    } catch (e) {
      console.warn('Could not fetch communities', e);
    }
  },

  renderCommunitiesList() {
    const list = document.getElementById('communities-list');
    if (!list) return;
    list.innerHTML = '';

    this.communities.forEach(c => {
      const item = document.createElement('div');
      item.className = `community-item ${c.slug === this.currentCommunity ? 'active' : ''}`;
      item.onclick = () => this.loadCommunityPosts(c.slug);
      item.innerHTML = `
        <div class="community-item-header">
          <div class="community-name">${c.name}</div>
          <span class="badge badge-slate">${c.specialty_tag}</span>
        </div>
        <div class="community-desc">${c.description}</div>
      `;
      list.appendChild(item);
    });
  },

  async loadCommunityPosts(slug) {
    if (!this.currentUser || (this.currentUser.role !== 'PATIENT' && this.currentUser.role !== 'ADMIN')) {
      this.checkCommunitiesAccess();
      return;
    }

    this.currentCommunity = slug;
    this.renderCommunitiesList();

    try {
      const headers = {
        'X-User-Id': this.currentUser?.id || '',
        'X-User-Role': this.currentUser?.role || ''
      };
      const res = await fetch(`/api/communities/${slug}/posts/`, { credentials: 'include', headers });
      const data = await res.json();
      if (data.status === 'success') {
        document.getElementById('active-community-name').textContent = data.community.name;
        document.getElementById('active-community-desc').textContent = data.community.description;

        const postsContainer = document.getElementById('community-posts-container');
        postsContainer.innerHTML = '';

        if (data.posts.length === 0) {
          postsContainer.innerHTML = `
            <div class="card" style="text-align: center; color: var(--text-muted); padding: 2.5rem;">
              <i class="fa-regular fa-comment-dots" style="font-size: 2.5rem; margin-bottom: 0.75rem; color: var(--text-light);"></i>
              <p>No discussions in this support group yet. Be the first to share your experience!</p>
            </div>
          `;
          return;
        }

        data.posts.forEach(post => {
          const card = document.createElement('div');
          card.className = 'post-card';
          
          let repliesHtml = '';
          if (post.replies && post.replies.length > 0) {
            repliesHtml = `
              <div class="replies-container">
                <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.4rem;">
                  <i class="fa-solid fa-comments"></i> Community Replies (${post.replies.length}):
                </div>
                ${post.replies.map(r => `
                  <div class="reply-item">
                    <div class="reply-header">
                      <span class="author-pill" style="font-size: 0.75rem; padding: 0.15rem 0.5rem;"><i class="fa-solid fa-user-shield"></i> ${r.author_alias}</span>
                      <span style="font-size: 0.75rem; color: var(--text-light);">${r.created_at}</span>
                    </div>
                    <div>${r.content}</div>
                  </div>
                `).join('')}
              </div>
            `;
          }

          card.innerHTML = `
            <div class="post-header">
              <span class="author-pill"><i class="fa-solid fa-user-shield"></i> ${post.author_alias}</span>
              <span class="post-time"><i class="fa-regular fa-clock"></i> ${post.created_at}</span>
            </div>
            <h3 class="post-title">${post.title}</h3>
            <p class="post-content">${post.content}</p>

            ${repliesHtml}

            <!-- Reply Form Inline -->
            <form class="reply-form" onsubmit="MedNova.handleReplySubmit(${post.id}, event)">
              <input type="text" class="form-control" style="font-size: 0.85rem; padding: 0.4rem 0.75rem;" placeholder="Reply anonymously..." required id="reply-input-${post.id}">
              <button type="submit" class="btn btn-outline btn-sm" style="white-space: nowrap;"><i class="fa-solid fa-reply"></i> Reply</button>
            </form>

            <div class="post-actions">
              <button class="btn btn-outline btn-sm" onclick="MedNova.likePost(${post.id}, this)">
                <i class="fa-regular fa-heart"></i> Helpful (${post.likes_count})
              </button>
              <span style="font-size: 0.78rem; color: #16a34a; margin-left: auto;">
                <i class="fa-solid fa-shield-check"></i> Anonymous Protected
              </span>
            </div>
          `;
          postsContainer.appendChild(card);
        });
      } else if (data.code === 'PATIENT_AUTH_REQUIRED') {
        this.checkCommunitiesAccess();
      }
    } catch (e) {
      console.warn('Could not load posts', e);
    }
  },

  async handleReplySubmit(postId, event) {
    event.preventDefault();
    if (!this.currentUser || (this.currentUser.role !== 'PATIENT' && this.currentUser.role !== 'ADMIN')) {
      this.showToast('Only registered patients can reply in support groups. Please log in or register.', 'warning');
      this.openLoginModal();
      return;
    }
    const input = document.getElementById(`reply-input-${postId}`);
    if (!input || !input.value.trim()) return;

    const payload = {
      author_alias: this.currentUser.alias || this.currentUser.username,
      content: input.value.trim()
    };

    try {
      const res = await fetch(`/api/communities/post/${postId}/reply/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': this.currentUser?.id || '',
          'X-User-Role': this.currentUser?.role || ''
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status === 'success') {
        this.showToast('Anonymous reply posted!', 'success');
        this.loadCommunityPosts(this.currentCommunity);
      } else {
        this.showToast(data.error || 'Failed to post reply', 'error');
      }
    } catch (e) {
      this.showToast('Network error on reply', 'error');
    }
  },

  async likePost(postId, btn) {
    if (!this.currentUser || (this.currentUser.role !== 'PATIENT' && this.currentUser.role !== 'ADMIN')) {
      this.showToast('Only registered patients can interact with support groups.', 'warning');
      this.openLoginModal();
      return;
    }
    try {
      const res = await fetch(`/api/communities/post/${postId}/like/`, {
        method: 'POST',
        headers: {
          'X-User-Id': this.currentUser?.id || '',
          'X-User-Role': this.currentUser?.role || ''
        },
        credentials: 'include'
      });
      const data = await res.json();
      if (data.status === 'success') {
        btn.innerHTML = `<i class="fa-solid fa-heart" style="color: #ef4444;"></i> Helpful (${data.likes_count})`;
      }
    } catch (e) {
      console.warn(e);
    }
  },

  navigateTo(viewName) {
    const views = ['home', 'communities', 'doctors', 'doctor-register', 'risk', 'my-consultations', 'doctor-portal', 'admin'];
    views.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      if (el) el.classList.add('hidden');
    });

    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));

    const targetEl = document.getElementById(`view-${viewName}`);
    if (targetEl) targetEl.classList.remove('hidden');

    const navEl = document.getElementById(`nav-${viewName}`);
    if (navEl) navEl.classList.add('active');

    if (viewName === 'communities') {
      const hasAccess = this.checkCommunitiesAccess();
      if (hasAccess) {
        this.fetchCommunities();
      }
    }
    if (viewName === 'doctors') this.fetchDoctors();
    if (viewName === 'doctor-register') this.fetchDoctors();
    if (viewName === 'my-consultations') this.loadPatientConsultations();
    if (viewName === 'doctor-portal') this.loadDoctorConsultations();
    if (viewName === 'admin') this.loadAdminDashboard();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  },

  closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  },

  switchToModal(closeId, openId) {
    this.closeModal(closeId);
    this.openModal(openId);
  },

  openLoginModal() { this.openModal('modal-login'); },
  openPatientSignupModal() { this.openModal('modal-patient-signup'); },
  openDoctorApplyModal() { this.navigateTo('doctor-register'); },
  openConsultationModal() {
    this.populateConsultDoctorSelect();
    this.openModal('modal-consultation');
  },
  openConsultationWithDoctor(docId) {
    this.populateConsultDoctorSelect();
    const sel = document.getElementById('consult-doctor-select');
    if (sel) sel.value = docId;
    this.openModal('modal-consultation');
  },
  openNewPostModal() {
    if (!this.currentUser || (this.currentUser.role !== 'PATIENT' && this.currentUser.role !== 'ADMIN')) {
      this.showToast('Only registered patients can create discussions in support groups. Please log in or register.', 'warning');
      this.openLoginModal();
      return;
    }
    const preview = document.getElementById('post-alias-preview');
    if (preview) {
      preview.textContent = this.currentUser.alias || this.currentUser.username;
    }
    this.openModal('modal-new-post');
  },

  async handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
      const res = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.status === 'success') {
        this.currentUser = data.user;
        localStorage.setItem('mednova_user', JSON.stringify(data.user));
        this.updateAuthUI();
        this.closeModal('modal-login');
        this.showToast(`Welcome back, ${data.user.alias}!`, 'success');

        if (data.user.role === 'ADMIN') this.navigateTo('admin');
        else if (data.user.role === 'DOCTOR') this.navigateTo('doctor-portal');
        else this.navigateTo('communities');
      } else {
        this.showToast(data.error || 'Login failed', 'error');
      }
    } catch (e) {
      this.showToast('Network error on login', 'error');
    }
  },

  async handlePatientSignup(event) {
    event.preventDefault();
    const email = document.getElementById('signup-email').value;
    const display_alias = document.getElementById('signup-alias').value;
    const password = document.getElementById('signup-password').value;

    try {
      const res = await fetch('/api/auth/register-patient/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, display_alias, password })
      });
      const data = await res.json();
      if (data.status === 'success') {
        this.showToast('Patient account created! Logging in...', 'success');
        this.closeModal('modal-patient-signup');
        // Auto-login
        document.getElementById('login-username').value = email;
        document.getElementById('login-password').value = password;
        this.handleLogin(new Event('submit'));
        this.fetchStats();
      } else {
        this.showToast(data.error || 'Registration failed', 'error');
      }
    } catch (e) {
      this.showToast('Network error on signup', 'error');
    }
  },

  async handleDoctorPageRegister(event) {
    event.preventDefault();
    const payload = {
      username: document.getElementById('page-doc-username').value,
      email: document.getElementById('page-doc-email').value,
      specialization: document.getElementById('page-doc-specialty').value,
      license_number: document.getElementById('page-doc-license').value,
      hospital_affiliation: document.getElementById('page-doc-hospital').value,
      bio: document.getElementById('page-doc-bio').value,
      password: document.getElementById('page-doc-password').value,
    };

    try {
      const res = await fetch('/api/auth/register-doctor/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status === 'success') {
        this.showToast('Doctor application submitted! Awaiting administrator review.', 'success');
        document.getElementById('form-doctor-page-register').reset();
        this.fetchDoctors();
        this.fetchStats();
      } else {
        this.showToast(data.error || 'Application failed', 'error');
      }
    } catch (e) {
      this.showToast('Network error on doctor registration', 'error');
    }
  },

  async handleConsultationSubmit(event) {
    event.preventDefault();
    const payload = {
      doctor_id: document.getElementById('consult-doctor-select').value,
      subject: document.getElementById('consult-subject').value,
      description: document.getElementById('consult-description').value,
      patient_alias: this.currentUser.role === 'PATIENT' ? this.currentUser.alias : 'AnonPatient#8F2A9C'
    };

    try {
      const res = await fetch('/api/consultations/request/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status === 'success') {
        this.showToast(`Case ${data.case_id} secured with AES-256 and sent!`, 'success');
        this.closeModal('modal-consultation');
        document.getElementById('form-consultation').reset();
        this.fetchStats();
        if (this.currentUser.role === 'PATIENT') {
          this.navigateTo('my-consultations');
        }
      } else {
        this.showToast(data.error || 'Consultation request failed', 'error');
      }
    } catch (e) {
      this.showToast('Network error on consultation', 'error');
    }
  },

  async handleNewPostSubmit(event) {
    event.preventDefault();
    if (!this.currentUser || (this.currentUser.role !== 'PATIENT' && this.currentUser.role !== 'ADMIN')) {
      this.showToast('Only registered patients can post in support groups.', 'warning');
      this.openLoginModal();
      return;
    }
    const payload = {
      author_alias: this.currentUser.alias || this.currentUser.username,
      title: document.getElementById('post-title').value,
      content: document.getElementById('post-content').value,
    };

    try {
      const res = await fetch(`/api/communities/${this.currentCommunity}/create-post/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': this.currentUser?.id || '',
          'X-User-Role': this.currentUser?.role || ''
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status === 'success') {
        this.showToast('Anonymous post published successfully!', 'success');
        this.closeModal('modal-new-post');
        document.getElementById('form-new-post').reset();
        this.loadCommunityPosts(this.currentCommunity);
        this.fetchStats();
      } else {
        this.showToast(data.error || 'Could not publish post', 'error');
      }
    } catch (e) {
      this.showToast('Network error', 'error');
    }
  },

  /* ================= HEALTH RISK ASSESSMENT ================= */
  async handleRiskAssessment(event) {
    event.preventDefault();
    const payload = {
      symptoms: document.getElementById('risk-symptoms').value,
      systolic: document.getElementById('risk-systolic').value,
      diastolic: document.getElementById('risk-diastolic').value,
      blood_sugar: document.getElementById('risk-sugar').value,
      duration: document.getElementById('risk-duration').value,
      pain_level: document.getElementById('risk-pain').value,
      has_fever: document.getElementById('risk-fever').checked,
      patient_alias: this.currentUser.alias || 'AnonPatient#Triage'
    };

    this.lastAssessedSymptoms = `Symptoms: ${payload.symptoms} (BP: ${payload.systolic}/${payload.diastolic}, Sugar: ${payload.blood_sugar} mg/dL, Duration: ${payload.duration})`;

    try {
      const res = await fetch('/api/consultations/assess-risk/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.status === 'success') {
        document.getElementById('risk-initial-placeholder').classList.add('hidden');
        document.getElementById('risk-result-card').classList.remove('hidden');

        const gauge = document.getElementById('risk-gauge');
        const scoreNum = document.getElementById('risk-score-num');
        const badge = document.getElementById('risk-badge-display');
        const rec = document.getElementById('risk-recommendation-text');
        const factorsList = document.getElementById('risk-factors-list');

        scoreNum.textContent = data.risk_score;
        gauge.className = `risk-score-display ${data.risk_category === 'HIGH_RISK' ? 'high' : data.risk_category === 'MODERATE_RISK' ? 'moderate' : 'low'}`;
        badge.className = `badge ${data.risk_category === 'HIGH_RISK' ? 'badge-amber' : data.risk_category === 'MODERATE_RISK' ? 'badge-blue' : 'badge-green'}`;
        badge.textContent = data.risk_category.replace('_', ' ');

        rec.textContent = data.recommendation;

        factorsList.innerHTML = '';
        if (data.risk_factors && data.risk_factors.length > 0) {
          data.risk_factors.forEach(f => {
            const li = document.createElement('li');
            li.textContent = f;
            factorsList.appendChild(li);
          });
        } else {
          factorsList.innerHTML = '<li>No acute clinical alarm indicators identified.</li>';
        }

        this.showToast('Health-risk calculation complete!', 'info');
      } else {
        this.showToast('Could not assess risk', 'error');
      }
    } catch (e) {
      this.showToast('Network error on risk triage', 'error');
    }
  },

  transferRiskToConsult() {
    this.openConsultationModal();
    const subj = document.getElementById('consult-subject');
    const desc = document.getElementById('consult-description');
    if (subj) subj.value = "Consultation requested following Risk Triage Assessment";
    if (desc) desc.value = this.lastAssessedSymptoms || "Symptom details evaluated during confidential risk check.";
  },

  /* ================= PATIENT CONSULTATIONS ================= */
  async loadPatientConsultations() {
    const container = document.getElementById('patient-consultations-container');
    if (!container) return;
    container.innerHTML = '<div style="text-align: center; padding: 2rem;">Loading your consultations...</div>';

    const alias = this.currentUser.role === 'PATIENT' ? this.currentUser.alias : 'AnonPatient#8F2A9C';
    try {
      const res = await fetch(`/api/consultations/my-consultations/?patient_alias=${encodeURIComponent(alias)}`);
      const data = await res.json();
      if (data.status === 'success') {
        container.innerHTML = '';
        if (data.cases.length === 0) {
          container.innerHTML = `
            <div class="card" style="text-align: center; color: var(--text-muted); padding: 3rem;">
              <i class="fa-solid fa-notes-medical" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
              <h4 style="color: var(--text-main);">No Consultations Found</h4>
              <p>You haven't requested any doctor consultations yet.</p>
              <button class="btn btn-primary btn-sm" style="margin-top: 1rem;" onclick="MedNova.openConsultationModal()">Book a Consultation</button>
            </div>
          `;
          return;
        }

        data.cases.forEach(c => {
          const isResolved = c.status === 'RESOLVED';
          const card = document.createElement('div');
          card.className = 'card';
          card.style.marginBottom = '1.25rem';
          card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
              <div>
                <span class="badge ${c.ai_risk_score === 'HIGH_RISK' ? 'badge-amber' : 'badge-blue'}">${c.ai_risk_score}</span>
                <span style="font-weight: 700; color: var(--text-main); margin-left: 0.5rem;">${c.case_id}</span>
                <span style="color: var(--text-muted); font-size: 0.82rem; margin-left: 0.5rem;">(${c.submitted_date})</span>
              </div>
              <span class="badge ${isResolved ? 'badge-green' : 'badge-slate'}">${c.status}</span>
            </div>
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">${c.subject}</h3>
            
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
              <strong>Assigned Doctor:</strong> ${c.doctor_name}
            </div>

            <div style="background: #f8fafc; border-left: 4px solid var(--primary); padding: 0.85rem; border-radius: var(--radius-sm); margin-bottom: 0.75rem;">
              <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.25rem;">
                <i class="fa-solid fa-lock"></i> Your Decrypted Symptom Journal:
              </div>
              <div style="font-size: 0.9rem; color: var(--text-main);">
                ${c.decrypted_description}
              </div>
            </div>

            <div style="background: ${isResolved ? '#f0fdf4' : '#fffbeb'}; border-left: 4px solid ${isResolved ? 'var(--success)' : 'var(--warning)'}; padding: 0.85rem; border-radius: var(--radius-sm);">
              <div style="font-size: 0.8rem; font-weight: 700; color: ${isResolved ? '#16a34a' : '#d97706'}; margin-bottom: 0.25rem;">
                <i class="fa-solid fa-user-doctor"></i> ${isResolved ? 'DOCTOR GUIDANCE & PRESCRIPTION:' : 'DOCTOR STATUS:'}
              </div>
              <div style="font-size: 0.9rem; color: var(--text-main);">${c.doctor_advice}</div>
            </div>
          `;
          container.appendChild(card);
        });
      }
    } catch (e) {
      container.innerHTML = '<div style="color: var(--danger);">Failed to load consultations.</div>';
    }
  },

  /* ================= DOCTOR WORKSPACE ================= */
  async loadDoctorConsultations() {
    const container = document.getElementById('doctor-consultations-list');
    if (!container) return;
    container.innerHTML = '<div style="text-align: center; padding: 2rem;">Loading consultations...</div>';

    try {
      let url = '/api/consultations/';
      if (this.currentUser.doctor_id) {
        url += `?doctor_id=${this.currentUser.doctor_id}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'success') {
        container.innerHTML = '';
        if (data.cases.length === 0) {
          container.innerHTML = '<div class="card" style="text-align: center; color: var(--text-muted); padding: 2rem;">No consultation cases currently assigned.</div>';
          return;
        }

        data.cases.forEach(c => {
          const isResolved = c.status === 'RESOLVED';
          const card = document.createElement('div');
          card.className = 'card';
          card.style.marginBottom = '1.25rem';
          card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
              <div>
                <span class="badge ${c.ai_risk_score === 'HIGH_RISK' ? 'badge-amber' : 'badge-blue'}">${c.ai_risk_score}</span>
                <span style="font-weight: 700; color: var(--text-main); margin-left: 0.5rem;">${c.case_id}</span>
                <span style="color: var(--text-muted); font-size: 0.82rem; margin-left: 0.5rem;">(${c.submitted_date})</span>
              </div>
              <span class="badge ${isResolved ? 'badge-green' : 'badge-slate'}">${c.status}</span>
            </div>
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">${c.subject}</h3>
            
            <div style="background: #f8fafc; border-left: 4px solid var(--primary); padding: 0.85rem; border-radius: var(--radius-sm); margin-bottom: 0.75rem;">
              <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.25rem;">
                <i class="fa-solid fa-lock"></i> AES-256 ENCRYPTED PAYLOAD (AT REST):
              </div>
              <div style="font-family: monospace; font-size: 0.78rem; word-break: break-all; color: var(--text-muted); margin-bottom: 0.5rem;">
                ${c.encrypted_payload.substring(0, 70)}...
              </div>
              <div style="font-size: 0.75rem; font-weight: 700; color: var(--success); margin-bottom: 0.25rem;">
                <i class="fa-solid fa-key"></i> CLINICALLY DECRYPTED PATIENT DESCRIPTION:
              </div>
              <div style="font-size: 0.9rem; color: var(--text-main);">
                ${c.decrypted_description}
              </div>
            </div>

            ${isResolved ? `
              <div style="background: #f0fdf4; border-left: 4px solid var(--success); padding: 0.85rem; border-radius: var(--radius-sm); margin-top: 0.5rem;">
                <div style="font-size: 0.8rem; font-weight: 700; color: #16a34a; margin-bottom: 0.25rem;">
                  <i class="fa-solid fa-notes-medical"></i> CLINICAL GUIDANCE RECORDED:
                </div>
                <div style="font-size: 0.9rem; color: var(--text-main);">${c.doctor_advice}</div>
              </div>
            ` : `
              <button class="btn btn-success btn-sm" style="margin-top: 0.5rem;" onclick="MedNova.openDoctorReplyModal('${c.case_id}', '${c.subject.replace(/'/g, "\\'")}')">
                <i class="fa-solid fa-reply"></i> Provide Medical Guidance
              </button>
            `}
          `;
          container.appendChild(card);
        });
      }
    } catch (e) {
      container.innerHTML = '<div style="color: var(--danger);">Failed to load consultations.</div>';
    }
  },

  openDoctorReplyModal(caseId, subject) {
    document.getElementById('reply-case-id').value = caseId;
    document.getElementById('reply-case-summary').innerHTML = `<strong>Case:</strong> ${caseId} &bull; <strong>Concern:</strong> ${subject}`;
    document.getElementById('reply-advice-text').value = '';
    this.openModal('modal-doctor-reply');
  },

  async handleDoctorReplySubmit(event) {
    event.preventDefault();
    const caseId = document.getElementById('reply-case-id').value;
    const advice = document.getElementById('reply-advice-text').value;

    try {
      const res = await fetch(`/api/consultations/respond/${caseId}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ advice, doctor_name: this.currentUser.alias })
      });
      const data = await res.json();
      if (data.status === 'success') {
        this.showToast('Clinical guidance dispatched successfully!', 'success');
        this.closeModal('modal-doctor-reply');
        this.loadDoctorConsultations();
      } else {
        this.showToast(data.error || 'Failed to submit response', 'error');
      }
    } catch (e) {
      this.showToast('Network error', 'error');
    }
  },

  /* ================= ADMIN 4-TAB DASHBOARD ================= */
  switchAdminTab(tabName) {
    const tabs = ['doctors', 'patients', 'communities', 'logs'];
    tabs.forEach(t => {
      const tabCard = document.getElementById(`admin-tab-${t}`);
      const tabBtn = document.getElementById(`btn-admin-tab-${t}`);
      if (tabCard) tabCard.classList.add('hidden');
      if (tabBtn) tabBtn.classList.remove('active');
    });

    const activeCard = document.getElementById(`admin-tab-${tabName}`);
    const activeBtn = document.getElementById(`btn-admin-tab-${tabName}`);
    if (activeCard) activeCard.classList.remove('hidden');
    if (activeBtn) activeBtn.classList.add('active');

    if (tabName === 'doctors') this.loadAdminDoctors();
    if (tabName === 'patients') this.loadAdminPatients();
    if (tabName === 'communities') this.loadAdminCommunityPosts();
    if (tabName === 'logs') this.loadAdminAuditLogs();
  },

  loadAdminDashboard() {
    this.switchAdminTab('doctors');
  },

  async loadAdminDoctors() {
    const tbody = document.getElementById('admin-doctors-table-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading doctor applications...</td></tr>';

    try {
      const res = await fetch('/api/auth/doctors/');
      const data = await res.json();
      if (data.status === 'success') {
        tbody.innerHTML = '';
        data.doctors.forEach(d => {
          const isVerified = d.status === 'VERIFIED';
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>
              <strong>${d.full_name}</strong><br>
              <span style="font-size: 0.78rem; color: var(--text-muted);">${d.license_number}</span>
            </td>
            <td>
              ${d.specialization}<br>
              <span style="font-size: 0.78rem; color: var(--text-muted);">${d.hospital_affiliation}</span>
            </td>
            <td><code>${d.license_number}</code></td>
            <td>${d.applied_date}</td>
            <td>
              <span class="badge ${isVerified ? 'badge-green' : 'badge-amber'}">${d.status}</span>
            </td>
            <td>
              ${isVerified ? `
                <button class="btn btn-outline btn-sm" onclick="MedNova.verifyDoctorAction(${d.id}, 'reject')">Revoke</button>
              ` : `
                <button class="btn btn-success btn-sm" onclick="MedNova.verifyDoctorAction(${d.id}, 'approve')">Approve & Verify</button>
                <button class="btn btn-danger btn-sm" onclick="MedNova.verifyDoctorAction(${d.id}, 'reject')">Reject</button>
              `}
            </td>
          `;
          tbody.appendChild(tr);
        });
      }
    } catch (e) {
      console.warn('Admin doctors load error', e);
    }
  },

  async verifyDoctorAction(doctorId, action) {
    try {
      const res = await fetch(`/api/auth/verify-doctor/${doctorId}/?action=${action}`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        this.showToast(data.message, 'success');
        this.loadAdminDoctors();
        this.fetchStats();
      } else {
        this.showToast(data.error || 'Action failed', 'error');
      }
    } catch (e) {
      this.showToast('Network error', 'error');
    }
  },

  async loadAdminPatients() {
    const tbody = document.getElementById('admin-patients-table-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading registered patients...</td></tr>';

    try {
      const res = await fetch('/api/auth/patients/');
      const data = await res.json();
      if (data.status === 'success') {
        tbody.innerHTML = '';
        if (data.patients.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No patient accounts registered yet.</td></tr>';
          return;
        }

        data.patients.forEach(p => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><span class="author-pill"><i class="fa-solid fa-user-shield"></i> ${p.display_alias}</span></td>
            <td>${p.email}</td>
            <td>${p.created_at}</td>
            <td><span class="badge ${p.is_active ? 'badge-green' : 'badge-slate'}">${p.is_active ? 'Active' : 'Suspended'}</span></td>
            <td>
              <button class="btn btn-outline btn-sm" onclick="MedNova.togglePatientStatus(${p.id})">
                ${p.is_active ? 'Suspend' : 'Activate'}
              </button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      }
    } catch (e) {
      console.warn('Admin patients load error', e);
    }
  },

  async togglePatientStatus(patientId) {
    try {
      const res = await fetch(`/api/auth/patients/${patientId}/toggle/`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        this.showToast(data.message, 'info');
        this.loadAdminPatients();
      } else {
        this.showToast(data.error || 'Failed to update patient', 'error');
      }
    } catch (e) {
      this.showToast('Network error', 'error');
    }
  },

  async loadAdminCommunityPosts() {
    const tbody = document.getElementById('admin-community-posts-body');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading community posts...</td></tr>';

    try {
      const res = await fetch('/api/communities/all-posts/');
      const data = await res.json();
      if (data.status === 'success') {
        tbody.innerHTML = '';
        if (data.posts.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No community discussions found.</td></tr>';
          return;
        }

        data.posts.forEach(p => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td><span class="badge badge-slate">${p.specialty_tag}</span></td>
            <td><span class="author-pill" style="font-size: 0.75rem;"><i class="fa-solid fa-user-shield"></i> ${p.author_alias}</span></td>
            <td><strong>${p.title}</strong><br><span style="font-size: 0.8rem; color: var(--text-muted);">${p.content.substring(0, 60)}...</span></td>
            <td>${p.created_at}</td>
            <td>${p.likes_count} likes, ${p.replies_count} replies</td>
            <td>
              <button class="btn btn-danger btn-sm" onclick="MedNova.deleteCommunityPost(${p.id})">
                <i class="fa-solid fa-trash"></i> Remove
              </button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      }
    } catch (e) {
      console.warn('Admin community posts error', e);
    }
  },

  async deleteCommunityPost(postId) {
    if (!confirm('Are you sure you want to remove this community discussion post?')) return;
    try {
      const res = await fetch(`/api/communities/post/${postId}/delete/`, { method: 'POST' });
      const data = await res.json();
      if (data.status === 'success') {
        this.showToast(data.message, 'success');
        this.loadAdminCommunityPosts();
        this.fetchStats();
      } else {
        this.showToast(data.error || 'Failed to delete post', 'error');
      }
    } catch (e) {
      this.showToast('Network error', 'error');
    }
  },

  async loadAdminAuditLogs() {
    const logsBody = document.getElementById('admin-audit-logs-body');
    if (!logsBody) return;
    logsBody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Loading audit logs...</td></tr>';

    try {
      const lRes = await fetch('/api/auth/audit-logs/');
      const lData = await lRes.json();
      if (lData.status === 'success') {
        logsBody.innerHTML = '';
        lData.logs.forEach(l => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td style="font-size: 0.78rem; color: var(--text-muted);">${l.timestamp}</td>
            <td><span class="badge badge-slate">${l.event_type}</span></td>
            <td><strong>${l.actor}</strong></td>
            <td style="font-size: 0.85rem;">${l.description}</td>
          `;
          logsBody.appendChild(tr);
        });
      }
    } catch (e) {
      console.warn('Admin logs error', e);
    }
  },

  logout() {
    fetch('/api/auth/logout/', { method: 'POST' });
    this.currentUser = { id: null, username: 'Guest', alias: 'Guest User', role: 'GUEST', doctor_id: null };
    localStorage.removeItem('mednova_user');
    this.updateAuthUI();
    this.navigateTo('home');
    this.showToast('You have been logged out.', 'info');
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  MedNova.init();
});
