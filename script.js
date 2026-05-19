// ============================================
// HOMELAND JOBS - FRONTEND WITH BACKEND API
// Connected to: http://localhost:5000/api
// Day 3 + Day 4 Integration
// Candidate: Oula Paul | ID: HEH/DK1/007
// ============================================

// ========== API CONFIGURATION ==========
const API_BASE_URL = 'http://localhost:5000/api';

// ========== APPLICATION STATE ==========
let appState = {
    jobs: [],
    filteredJobs: [],
    isLoading: true,
    error: null,
    selectedJob: null,
    isModalOpen: false,
    searchTerm: "",
    category: "All",
    location: "All",
    minBudget: 0,
    maxBudget: 500000,
    sortBy: "newest",
    authToken: null,
    currentUser: null
};

// Filter options
const CATEGORIES = ["All", "Frontend", "Backend", "Design", "DevOps", "Mobile", "Data Science", "Security", "Management"];
const LOCATIONS = ["All", "Nairobi", "Mombasa", "Kisumu", "Eldoret", "Remote"];

// ========== HELPER FUNCTIONS ==========
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatKES(amount) {
    return 'KES ' + amount.toLocaleString();
}

// ========== BACKEND API CALLS ==========

// Fetch all jobs from backend
async function fetchJobsFromBackend() {
    appState.isLoading = true;
    appState.error = null;
    render();
    
    try {
        const response = await fetch(`${API_BASE_URL}/jobs`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        appState.jobs = data.jobs.map(job => ({
            id: job.id,
            title: job.title,
            employer: job.employer_name || `Employer ${job.employer_id}`,
            employerRating: 4.5,
            budget: job.budget,
            location: job.location,
            skills: job.category ? [job.category] : ['General'],
            postedDate: job.created_at ? job.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            proposalCount: job.proposalCount || 0,
            deadline: job.deadline || '2026-06-30',
            description: job.description || 'No description provided'
        }));
        
        appState.filteredJobs = [...appState.jobs];
        appState.isLoading = false;
        filterAndSortJobs();
        
    } catch (error) {
        console.error('API Error:', error);
        appState.isLoading = false;
        appState.error = '❌ Cannot connect to backend server.\n\nMake sure the API is running on port 5000.\n\nStart it with:\ncd "C:\Users\Oula Junior\Desktop\HomelandJobs-API\homeland-jobs-api"\nnpm start';
        render();
    }
}

// Register a new user
async function registerUser(name, email, phone, password, role) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password, role })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || data.message || 'Registration failed');
        }
        
        alert(`✅ Registration successful! Welcome ${data.user.name}. Please login.`);
        return true;
    } catch (error) {
        alert(`❌ Registration failed: ${error.message}`);
        return false;
    }
}

// Login user
async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        
        appState.authToken = data.accessToken;
        
        const userResponse = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${appState.authToken}` }
        });
        const userData = await userResponse.json();
        appState.currentUser = userData.user;
        
        alert(`✅ Login successful! Welcome ${appState.currentUser.name} (${appState.currentUser.role})`);
        render();
        return true;
    } catch (error) {
        alert(`❌ Login failed: ${error.message}`);
        return false;
    }
}

// Submit a proposal
async function submitProposalToBackend(jobId, coverLetter, proposedBudget, timelineDays) {
    if (!appState.authToken) {
        alert('❌ Please login first to submit a proposal');
        return false;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/proposals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${appState.authToken}`
            },
            body: JSON.stringify({
                cover_letter: coverLetter,
                proposed_budget: parseFloat(proposedBudget),
                timeline_days: parseInt(timelineDays)
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 409) {
                throw new Error('You have already submitted a proposal for this job');
            }
            throw new Error(data.error || data.message || 'Proposal submission failed');
        }
        
        alert(`✅ Proposal submitted successfully!`);
        return true;
    } catch (error) {
        alert(`❌ Proposal failed: ${error.message}`);
        return false;
    }
}

// ========== FILTER AND SORT ==========
function filterAndSortJobs() {
    let filtered = [...appState.jobs];
    
    if (appState.searchTerm.trim()) {
        const term = appState.searchTerm.toLowerCase();
        filtered = filtered.filter(job =>
            job.title.toLowerCase().includes(term) ||
            job.employer.toLowerCase().includes(term)
        );
    }
    
    if (appState.category !== "All") {
        filtered = filtered.filter(job =>
            job.skills.some(skill => skill.toLowerCase().includes(appState.category.toLowerCase()))
        );
    }
    
    if (appState.location !== "All") {
        filtered = filtered.filter(job => job.location === appState.location);
    }
    
    filtered = filtered.filter(job =>
        job.budget >= appState.minBudget && job.budget <= appState.maxBudget
    );
    
    switch (appState.sortBy) {
        case "newest":
            filtered.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
            break;
        case "budget-high-low":
            filtered.sort((a, b) => b.budget - a.budget);
            break;
        case "budget-low-high":
            filtered.sort((a, b) => a.budget - b.budget);
            break;
    }
    
    appState.filteredJobs = filtered;
    render();
}

// ========== MODAL FUNCTIONS ==========
function openJobModal(job) {
    appState.selectedJob = job;
    appState.isModalOpen = true;
    render();
    renderModal();
}

function closeModal() {
    appState.isModalOpen = false;
    appState.selectedJob = null;
    render();
    const modalContainer = document.getElementById('dynamicModal');
    if (modalContainer) modalContainer.remove();
}

function handleProposalSubmit(event) {
    event.preventDefault();
    
    const coverLetter = document.getElementById('coverLetter').value;
    const proposedBudget = document.getElementById('proposedBudget').value;
    const timeline = document.getElementById('timeline').value;
    
    let errors = [];
    
    if (!coverLetter || coverLetter.trim().length < 50) {
        errors.push({ field: 'coverLetter', message: 'Cover letter must be at least 50 characters' });
    }
    if (!proposedBudget || parseFloat(proposedBudget) <= 0) {
        errors.push({ field: 'proposedBudget', message: 'Please enter a valid budget amount greater than 0' });
    }
    if (!timeline || parseInt(timeline) <= 0) {
        errors.push({ field: 'timeline', message: 'Please enter a valid timeline in days (minimum 1 day)' });
    }
    
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('.form-input, .form-textarea').forEach(el => el.classList.remove('error'));
    
    if (errors.length > 0) {
        errors.forEach(err => {
            const input = document.getElementById(err.field);
            if (input) {
                input.classList.add('error');
                const errorDiv = document.createElement('span');
                errorDiv.className = 'error-message';
                errorDiv.textContent = err.message;
                input.parentNode.appendChild(errorDiv);
            }
        });
        return;
    }
    
    submitProposalToBackend(
        appState.selectedJob.id,
        coverLetter,
        proposedBudget,
        timeline
    ).then(success => {
        if (success) {
            const formContainer = document.getElementById('proposalFormContainer');
            if (formContainer) {
                formContainer.innerHTML = `
                    <div class="confirmation-state">
                        <div class="empty-state-icon">✅</div>
                        <h3>Proposal Submitted Successfully!</h3>
                        <p>Your proposal for <strong>${escapeHtml(appState.selectedJob.title)}</strong> has been sent.</p>
                        <button class="apply-btn" onclick="closeModal()" style="margin-top: 1rem;">Close</button>
                    </div>
                `;
            }
        }
    });
}

function renderModal() {
    if (!appState.isModalOpen || !appState.selectedJob) return;
    
    const existingModal = document.getElementById('dynamicModal');
    if (existingModal) existingModal.remove();
    
    const job = appState.selectedJob;
    const modalHtml = `
        <div id="dynamicModal">
            <div class="modal-overlay" id="modalOverlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2>${escapeHtml(job.title)}</h2>
                        <button class="modal-close" id="closeModalBtn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <section>
                            <h3>📋 Job Details</h3>
                            <p><strong>🏢 Employer:</strong> ${escapeHtml(job.employer)} ★ ${job.employerRating}/5</p>
                            <p><strong>💰 Budget:</strong> ${formatKES(job.budget)}</p>
                            <p><strong>📍 Location:</strong> ${job.location}</p>
                            <p><strong>📄 Description:</strong> ${escapeHtml(job.description)}</p>
                        </section>
                        <hr>
                        <section id="proposalFormContainer">
                            <h3>📝 Submit Your Proposal</h3>
                            ${!appState.authToken ? `
                                <div style="text-align:center;padding:1rem;">
                                    <p>⚠️ Please login to submit a proposal</p>
                                    <button class="apply-btn" onclick="showLoginPrompt()">Login</button>
                                </div>
                            ` : `
                                <form id="proposalForm" onsubmit="handleProposalSubmit(event)">
                                    <div class="form-group">
                                        <label class="form-label">Cover Letter *</label>
                                        <textarea id="coverLetter" class="form-textarea" rows="4" required></textarea>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Proposed Budget (KES) *</label>
                                        <input type="number" id="proposedBudget" class="form-input" required>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Timeline (Days) *</label>
                                        <input type="number" id="timeline" class="form-input" required>
                                    </div>
                                    <button type="submit" class="submit-btn">Submit Proposal</button>
                                </form>
                            `}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
    
    const overlay = document.getElementById('modalOverlay');
    if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
    
    const closeBtn = document.getElementById('closeModalBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
}

function showLoginPrompt() {
    const email = prompt('Enter your email:');
    const password = prompt('Enter your password:');
    if (email && password) loginUser(email, password);
}

function showRegisterPrompt() {
    const name = prompt('Enter your name:');
    const email = prompt('Enter your email:');
    const phone = prompt('Enter your phone (e.g., 0712345678):');
    const password = prompt('Enter your password (min 8 chars, 1 uppercase, 1 number):');
    const role = confirm('OK for Freelancer, Cancel for Employer') ? 'freelancer' : 'employer';
    if (name && email && phone && password) registerUser(name, email, phone, password, role);
}

// ========== MAIN RENDER FUNCTION ==========
function render() {
    const root = document.getElementById('root');
    if (!root) return;
    
    const authStatus = appState.authToken && appState.currentUser
        ? `<span style="color:#27ae60;">✅ ${appState.currentUser.name} (${appState.currentUser.role})</span>`
        : `<span style="color:#e74c3c;">🔒 Not logged in</span>`;
    
    if (appState.isLoading) {
        root.innerHTML = `
            <div class="app-container">
                <header class="sticky-header">
                    <a href="#" class="logo">Homeland<span>Jobs</span></a>
                    <ul class="nav-links">
                        <li><a href="#">Home</a></li>
                        <li><a href="#">Jobs</a></li>
                        <li><a href="#">Post a Job</a></li>
                        <li><a href="#" id="loginBtn">Login</a></li>
                        <li><a href="#" id="registerBtn">Register</a></li>
                    </ul>
                </header>
                <main class="main-content">
                    <div class="job-stats" style="text-align:center;">${authStatus}</div>
                    <div class="job-grid">
                        ${Array(6).fill().map(() => `
                            <div class="skeleton-card">
                                <div class="skeleton-title"></div>
                                <div class="skeleton-text"></div>
                            </div>
                        `).join('')}
                    </div>
                </main>
            </div>
        `;
        attachEventListeners();
        return;
    }
    
    if (appState.error) {
        root.innerHTML = `
            <div class="app-container">
                <header class="sticky-header">
                    <a href="#" class="logo">Homeland<span>Jobs</span></a>
                    <ul class="nav-links">
                        <li><a href="#">Home</a></li>
                        <li><a href="#">Jobs</a></li>
                        <li><a href="#">Post a Job</a></li>
                        <li><a href="#" id="loginBtn">Login</a></li>
                        <li><a href="#" id="registerBtn">Register</a></li>
                    </ul>
                </header>
                <main class="main-content">
                    <div class="error-state">
                        <h2>⚠️ Cannot Connect to Backend</h2>
                        <p>Make sure the API is running on port 5000</p>
                        <button class="retry-btn" onclick="fetchJobsFromBackend()">⟳ Retry</button>
                    </div>
                </main>
                <footer class="app-footer">
                    <p>&copy; 2026 Homeland Jobs. All rights reserved.</p>
                </footer>
            </div>
        `;
        attachEventListeners();
        return;
    }
    
    const filterHtml = `
        <div class="filters-section">
            <div style="display:flex;justify-content:space-between;margin-bottom:1rem;">
                <div>Showing <strong>${appState.filteredJobs.length}</strong> of <strong>${appState.jobs.length}</strong> jobs</div>
                <div>${authStatus}</div>
            </div>
            <input type="text" class="search-bar" placeholder="🔍 Search jobs..." id="searchInput">
            <div class="filter-group">
                <select class="filter-select" id="categoryFilter">${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}</select>
                <select class="filter-select" id="locationFilter">${LOCATIONS.map(l => `<option value="${l}">${l}</option>`).join('')}</select>
                <input type="number" class="budget-input" placeholder="Min Budget" id="minBudget">
                <input type="number" class="budget-input" placeholder="Max Budget" id="maxBudget">
                <select class="sort-dropdown" id="sortSelect">
                    <option value="newest">Newest First</option>
                    <option value="budget-high-low">Budget: High to Low</option>
                    <option value="budget-low-high">Budget: Low to High</option>
                </select>
            </div>
        </div>
    `;
    
    if (appState.filteredJobs.length === 0) {
        root.innerHTML = `
            <div class="app-container">
                <header class="sticky-header">
                    <a href="#" class="logo">Homeland<span>Jobs</span></a>
                    <ul class="nav-links">
                        <li><a href="#">Home</a></li>
                        <li><a href="#">Jobs</a></li>
                        <li><a href="#">Post a Job</a></li>
                        <li><a href="#" id="loginBtn">Login</a></li>
                        <li><a href="#" id="registerBtn">Register</a></li>
                    </ul>
                </header>
                <main class="main-content">
                    ${filterHtml}
                    <div class="empty-state"><h3>No jobs found</h3><p>Try adjusting your filters</p></div>
                </main>
                <footer class="app-footer">
                    <p>&copy; 2026 Homeland Jobs. All rights reserved.</p>
                </footer>
            </div>
        `;
        attachEventListeners();
        return;
    }
    
    root.innerHTML = `
        <div class="app-container">
            <header class="sticky-header">
                <a href="#" class="logo">Homeland<span>Jobs</span></a>
                <ul class="nav-links">
                    <li><a href="#">Home</a></li>
                    <li><a href="#">Jobs</a></li>
                    <li><a href="#">Post a Job</a></li>
                    <li><a href="#" id="loginBtn">Login</a></li>
                    <li><a href="#" id="registerBtn">Register</a></li>
                </ul>
            </header>
            <main class="main-content">
                ${filterHtml}
                <div class="job-grid">
                    ${appState.filteredJobs.map(job => `
                        <article class="job-card" data-job-id="${job.id}">
                            <h3>${escapeHtml(job.title)}</h3>
                            <div>🏢 ${escapeHtml(job.employer)} ★ ${job.employerRating}</div>
                            <div class="job-budget">💰 ${formatKES(job.budget)}</div>
                            <div>📍 ${job.location}</div>
                            <div class="skills-tags">${job.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div>
                            <div class="job-meta">
                                <span>📅 ${job.postedDate}</span>
                                <span>📄 ${job.proposalCount} proposals</span>
                                <button class="apply-btn" data-job-id="${job.id}">Apply Now</button>
                            </div>
                        </article>
                    `).join('')}
                </div>
            </main>
            <footer class="app-footer">
                <p>&copy; 2026 Homeland Jobs. All rights reserved.</p>
            </footer>
        </div>
    `;
    
    attachEventListeners();
}

function attachEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', (e) => { appState.searchTerm = e.target.value; filterAndSortJobs(); });
    
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) categoryFilter.addEventListener('change', (e) => { appState.category = e.target.value; filterAndSortJobs(); });
    
    const locationFilter = document.getElementById('locationFilter');
    if (locationFilter) locationFilter.addEventListener('change', (e) => { appState.location = e.target.value; filterAndSortJobs(); });
    
    const minBudget = document.getElementById('minBudget');
    const maxBudget = document.getElementById('maxBudget');
    if (minBudget) minBudget.addEventListener('change', (e) => { appState.minBudget = parseInt(e.target.value) || 0; filterAndSortJobs(); });
    if (maxBudget) maxBudget.addEventListener('change', (e) => { appState.maxBudget = parseInt(e.target.value) || 500000; filterAndSortJobs(); });
    
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.addEventListener('change', (e) => { appState.sortBy = e.target.value; filterAndSortJobs(); });
    
    document.querySelectorAll('.job-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('apply-btn')) return;
            const jobId = parseInt(card.dataset.jobId);
            const job = appState.jobs.find(j => j.id === jobId);
            if (job) openJobModal(job);
        });
    });
    
    document.querySelectorAll('.apply-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const jobId = parseInt(btn.dataset.jobId);
            const job = appState.jobs.find(j => j.id === jobId);
            if (job) openJobModal(job);
        });
    });
    
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    if (loginBtn) loginBtn.addEventListener('click', () => showLoginPrompt());
    if (registerBtn) registerBtn.addEventListener('click', () => showRegisterPrompt());
}

// Make functions global
window.closeModal = closeModal;
window.handleProposalSubmit = handleProposalSubmit;
window.showLoginPrompt = showLoginPrompt;
window.showRegisterPrompt = showRegisterPrompt;
window.fetchJobsFromBackend = fetchJobsFromBackend;

// Initialize
fetchJobsFromBackend();