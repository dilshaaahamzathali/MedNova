/**
 * MedNova Authentication & Role Management Module
 */

window.MedNovaAuth = {
  lastRegisteredDoctor: null,

  init() {
    this.bindEvents();
    this.updateUserDisplay();
  },

  bindEvents() {
    // Header LOG IN button
    const loginHeaderBtn = document.getElementById('btn-header-login');
    if (loginHeaderBtn) {
      loginHeaderBtn.addEventListener('click', () => this.openLoginModal('DOCTOR'));
    }

    // Header LOGOUT button
    const logoutBtn = document.getElementById('btn-logout-header');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }

    // Login Form Submit
    const loginForm = document.getElementById('form-login');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Doctor Registration Form Submit
    const docRegForm = document.getElementById('form-doctor-register');
    if (docRegForm) {
      docRegForm.addEventListener('submit', (e) => this.handleDoctorRegistration(e));
    }
  },

  logout() {
    MedNovaData.currentUser = {
      id: null,
      name: "Guest User",
      email: "",
      role: "GUEST",
      avatar: "G"
    };
    this.updateUserDisplay();
    this.switchPortal('landing');
    MedNovaApp.showToast('Logged out successfully.', 'info');
  },

  switchPortal(portalName) {
    document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));

    // Hide all portal views
    const landingView = document.getElementById('landing-portal-view');
    const adminView = document.getElementById('admin-portal-view');
    const doctorView = document.getElementById('doctor-portal-view');
    const regView = document.getElementById('doctor-reg-view');

    if (landingView) landingView.classList.add('hidden');
    if (adminView) adminView.classList.add('hidden');
    if (doctorView) doctorView.classList.add('hidden');
    if (regView) regView.classList.add('hidden');

    if (portalName === 'landing') {
      if (landingView) landingView.classList.remove('hidden');
    } else if (portalName === 'admin') {
      if (MedNovaData.currentUser.role !== 'ADMIN') {
        this.openLoginModal('ADMIN');
        return;
      }
      if (adminView) adminView.classList.remove('hidden');
      MedNovaAdmin.render();
    } else if (portalName === 'doctor') {
      if (MedNovaData.currentUser.role !== 'DOCTOR') {
        this.openLoginModal('DOCTOR');
        return;
      }
      if (doctorView) doctorView.classList.remove('hidden');
      MedNovaDoctor.render();
    } else if (portalName === 'register') {
      if (regView) regView.classList.remove('hidden');
    }
  },

  switchToDoctorProfile(doctorId) {
    const doc = MedNovaData.doctors.find(d => d.id === doctorId);
    if (doc) {
      MedNovaData.currentUser = {
        id: doc.id,
        name: doc.name,
        email: doc.email,
        role: "DOCTOR",
        specialization: doc.specialization,
        status: doc.status,
        avatar: doc.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').substring(0, 2)
      };
      this.updateUserDisplay();
    }
  },

  openLoginModal(targetRole = 'DOCTOR') {
    const modal = document.getElementById('modal-login');
    const title = document.getElementById('login-modal-title');
    const roleInput = document.getElementById('login-role-type');
    const subtitle = document.getElementById('login-modal-subtitle');
    const demoCredentialsHint = document.getElementById('login-demo-hint');

    if (targetRole === 'ADMIN') {
      title.innerText = 'Administrator Portal Login';
      subtitle.innerText = 'Enter system administrator email and password.';
      roleInput.value = 'ADMIN';
      document.getElementById('login-email').value = 'admin@mednova.org';
      document.getElementById('login-password').value = 'Admin@MedNova2026!';
      if (demoCredentialsHint) {
        demoCredentialsHint.innerHTML = `💡 <strong>Admin Demo Login:</strong> <code>admin@mednova.org</code> / <code>Admin@MedNova2026!</code>`;
      }
    } else {
      title.innerText = 'Doctor Portal Login';
      subtitle.innerText = 'Enter your registered doctor email and password.';
      roleInput.value = 'DOCTOR';
      document.getElementById('login-email').value = 'elizabeth.vance@mednova.org';
      document.getElementById('login-password').value = 'Doctor@123';
      if (demoCredentialsHint) {
        demoCredentialsHint.innerHTML = `
          💡 <strong>Registered Doctors (Password: <code>Doctor@123</code>):</strong><br>
          • <code>elizabeth.vance@mednova.org</code> (Cardiology - Verified)<br>
          • <code>marcus.brody@mednova.org</code> (General Medicine - Verified)<br>
          • <code>aisha.sharma@mednova.org</code> (Neurology - Pending)<br>
          • <code>jonathan.reed@mednova.org</code> (Dermatology - Pending)<br>
          • Or enter any newly registered doctor email!
        `;
      }
    }

    if (modal) modal.classList.add('active');
  },

  handleLogin(e) {
    if (e) e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!email || !password) {
      MedNovaApp.showToast('Please enter both Email and Password.', 'error');
      return;
    }

    // Smart Auto-Role Detection: Check if Admin or Doctor
    if (email.toLowerCase() === 'admin@mednova.org' || email.toLowerCase() === 'admin') {
      if (password === 'Admin@MedNova2026!') {
        MedNovaData.currentUser = {
          id: 'usr_admin_01',
          name: 'System Administrator',
          email: 'admin@mednova.org',
          role: 'ADMIN',
          avatar: 'SA'
        };
        this.updateUserDisplay();
        document.getElementById('modal-login').classList.remove('active');
        MedNovaApp.showToast('Authenticated successfully as Administrator!', 'success');
        this.switchPortal('admin');

        MedNovaData.auditLogs.unshift({
          id: `log_${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          eventType: 'ADMIN_LOGIN_SUCCESS',
          actor: 'admin@mednova.org',
          description: 'Administrator logged in.'
        });
      } else {
        MedNovaApp.showToast('Incorrect password for Administrator account.', 'error');
      }
      return;
    }

    // Check if Doctor Account
    const doc = MedNovaData.doctors.find(d => d.email.toLowerCase() === email.toLowerCase());
    
    if (doc) {
      const validPassword = doc.password || 'Doctor@123';
      if (password !== validPassword) {
        MedNovaApp.showToast('Incorrect password for doctor account.', 'error');
        return;
      }

      this.switchToDoctorProfile(doc.id);
      document.getElementById('modal-login').classList.remove('active');
      
      if (doc.status === 'VERIFIED') {
        MedNovaApp.showToast(`Login successful! Welcome back, ${doc.name}.`, 'success');
      } else {
        MedNovaApp.showToast(`Logged in as ${doc.name}. Status: ${doc.status} (Pending Admin Review).`, 'info');
      }

      MedNovaData.auditLogs.unshift({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        eventType: 'DOCTOR_LOGIN_SUCCESS',
        actor: doc.email,
        description: `Doctor ${doc.name} logged in.`
      });

      this.switchPortal('doctor');
      return;
    }

    // Neither Admin nor Doctor found
    MedNovaApp.showToast(`No account found with email "${email}". Please register your license first.`, 'error');
  },

  handleDoctorRegistration(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('reg-doc-name').value.trim();
    const email = document.getElementById('reg-doc-email').value.trim();
    const password = document.getElementById('reg-doc-password').value.trim() || 'Doctor@123';
    const license = document.getElementById('reg-doc-license').value.trim();
    const council = document.getElementById('reg-doc-council').value.trim();
    const spec = document.getElementById('reg-doc-spec').value;
    const hospital = document.getElementById('reg-doc-hospital').value.trim();
    const exp = document.getElementById('reg-doc-exp').value;

    if (!name || !email || !license || !council) {
      MedNovaApp.showToast('Please fill out all required fields.', 'error');
      return;
    }

    const formattedName = name.startsWith('Dr.') ? name : `Dr. ${name}`;

    const newDoctor = {
      id: `doc_${Date.now()}`,
      name: formattedName,
      email: email,
      password: password,
      specialization: spec,
      licenseNumber: license,
      council: council,
      hospital: hospital || 'Independent Practitioner',
      experienceYears: parseInt(exp) || 5,
      status: 'PENDING_VERIFICATION',
      appliedDate: new Date().toISOString().split('T')[0],
      verifiedDate: null,
      documentUrl: `license_${license.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
    };

    MedNovaData.doctors.unshift(newDoctor);
    this.lastRegisteredDoctor = newDoctor;

    MedNovaData.auditLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      eventType: 'DOCTOR_SELF_REGISTER',
      actor: email,
      description: `New Doctor Registration submitted by ${newDoctor.name} (${email}). License #${license}.`
    });

    MedNovaAdmin.render();

    document.getElementById('form-doctor-register').reset();

    document.getElementById('reg-success-doc-name').innerText = newDoctor.name;
    document.getElementById('reg-success-doc-email').innerText = newDoctor.email;
    document.getElementById('reg-success-doc-license').innerText = newDoctor.licenseNumber;
    document.getElementById('reg-success-doc-spec').innerText = newDoctor.specialization;

    MedNovaApp.openModal('modal-reg-success');
    MedNovaApp.showToast(`Doctor Registration Submitted! Status: PENDING_VERIFICATION`, 'success');
  },

  goToAdminToVerifyNewDoctor() {
    MedNovaApp.closeModal('modal-reg-success');
    MedNovaData.currentUser = {
      id: 'usr_admin_01',
      name: 'System Administrator',
      email: 'admin@mednova.org',
      role: 'ADMIN',
      avatar: 'SA'
    };
    this.updateUserDisplay();
    this.switchPortal('admin');
    MedNovaAdmin.switchAdminTab('verification');
    MedNovaAdmin.renderVerificationQueue('PENDING');
  },

  loginAsNewRegisteredDoctor() {
    MedNovaApp.closeModal('modal-reg-success');
    if (this.lastRegisteredDoctor) {
      this.switchToDoctorProfile(this.lastRegisteredDoctor.id);
      this.switchPortal('doctor');
    }
  },

  updateUserDisplay() {
    const u = MedNovaData.currentUser;
    const loginBtn = document.getElementById('btn-header-login');
    const logoutBtn = document.getElementById('btn-logout-header');

    if (u && u.role !== 'GUEST') {
      document.getElementById('header-user-avatar').innerText = u.avatar || 'U';
      document.getElementById('header-user-name').innerText = u.name;
      const badge = document.getElementById('header-user-role');
      badge.innerText = u.role === 'ADMIN' ? 'Platform Administrator' : `Doctor (${u.specialization || 'General'})`;

      if (loginBtn) loginBtn.classList.add('hidden');
      if (logoutBtn) logoutBtn.classList.remove('hidden');
    } else {
      document.getElementById('header-user-avatar').innerText = 'G';
      document.getElementById('header-user-name').innerText = 'Guest User';
      document.getElementById('header-user-role').innerText = 'Select Portal';

      if (loginBtn) loginBtn.classList.remove('hidden');
      if (logoutBtn) logoutBtn.classList.add('hidden');
    }
  }
};
