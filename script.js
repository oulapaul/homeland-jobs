// ============================================
// HOMELAND JOBS - MAIN APPLICATION
// Day 3 Frontend Practical Build
// Candidate: Oula Paul | ID: HEH/DK1/007
// Date: May 2026
// ============================================
// WHY: Vanilla JavaScript ensures no build tools needed
// All components are self-contained with clear state management
// ============================================

// ---------- MOCK JOB DATA (12 jobs - all dates updated to MAY 2026) ----------
const MOCK_JOBS = [
    { id: 1, title: "Senior Frontend Developer", employer: "TechCorp Kenya", employerRating: 4.8, budget: 150000, location: "Nairobi", skills: ["React", "JavaScript", "CSS", "Tailwind"], postedDate: "2026-05-10", proposalCount: 12, deadline: "2026-06-15", description: "Looking for an experienced frontend developer to build responsive web applications. Must have 3+ years React experience and strong portfolio." },
    { id: 2, title: "Backend Engineer", employer: "Fintech Solutions", employerRating: 4.5, budget: 180000, location: "Mombasa", skills: ["Node.js", "Python", "PostgreSQL", "Docker"], postedDate: "2026-05-09", proposalCount: 8, deadline: "2026-06-10", description: "Build scalable APIs and database architectures for our payment platform. Experience with microservices preferred." },
    { id: 3, title: "UI/UX Designer", employer: "Creative Studio", employerRating: 4.9, budget: 120000, location: "Kisumu", skills: ["Figma", "Adobe XD", "Prototyping", "User Research"], postedDate: "2026-05-08", proposalCount: 15, deadline: "2026-06-05", description: "Design intuitive user interfaces for mobile and web applications. Create wireframes, prototypes, and user flows." },
    { id: 4, title: "DevOps Engineer", employer: "Cloud Native Africa", employerRating: 4.7, budget: 200000, location: "Nairobi", skills: ["AWS", "Docker", "Kubernetes", "Terraform"], postedDate: "2026-05-07", proposalCount: 6, deadline: "2026-06-20", description: "Manage cloud infrastructure and CI/CD pipelines. Automate deployment processes and monitor system health." },
    { id: 5, title: "Mobile Developer (Flutter)", employer: "AppWorks", employerRating: 4.6, budget: 160000, location: "Remote", skills: ["Flutter", "Dart", "Firebase", "REST APIs"], postedDate: "2026-05-06", proposalCount: 10, deadline: "2026-06-12", description: "Build cross-platform mobile applications for clients. Experience with state management and native integrations." },
    { id: 6, title: "Data Scientist", employer: "Analytics Hub", employerRating: 4.8, budget: 190000, location: "Nairobi", skills: ["Python", "TensorFlow", "SQL", "Pandas"], postedDate: "2026-05-05", proposalCount: 7, deadline: "2026-06-18", description: "Analyze data and build ML models for business insights. Strong statistical background required." },
    { id: 7, title: "WordPress Developer", employer: "WebSolutions", employerRating: 4.4, budget: 80000, location: "Eldoret", skills: ["PHP", "WordPress", "Elementor", "WooCommerce"], postedDate: "2026-05-04", proposalCount: 20, deadline: "2026-06-01", description: "Custom theme and plugin development for WordPress sites. Experience with ACF and custom post types." },
    { id: 8, title: "Cybersecurity Analyst", employer: "SecureNet", employerRating: 4.9, budget: 220000, location: "Nairobi", skills: ["Network Security", "Penetration Testing", "ISO 27001"], postedDate: "2026-05-03", proposalCount: 5, deadline: "2026-06-25", description: "Protect infrastructure and perform security audits. Conduct vulnerability assessments and incident response." },
    { id: 9, title: "Project Manager", employer: "Agile Masters", employerRating: 4.7, budget: 170000, location: "Mombasa", skills: ["Agile", "Scrum", "JIRA", "Confluence"], postedDate: "2026-05-02", proposalCount: 9, deadline: "2026-06-14", description: "Lead development teams and manage project timelines. Certified Scrum Master preferred." },
    { id: 10, title: "QA Engineer", employer: "Quality First", employerRating: 4.5, budget: 100000, location: "Kisumu", skills: ["Selenium", "Jest", "Cypress", "Postman"], postedDate: "2026-05-01", proposalCount: 11, deadline: "2026-06-08", description: "Write and execute test cases, automate testing processes. Experience with CI/CD integration." },
    { id: 11, title: "Full Stack Developer", employer: "Startup Hub", employerRating: 4.8, budget: 210000, location: "Remote", skills: ["React", "Node.js", "MongoDB", "Express"], postedDate: "2026-04-30", proposalCount: 14, deadline: "2026-06-22", description: "End-to-end feature development for web platform. Build both frontend and backend components." },
    { id: 12, title: "Technical Writer", employer: "Docs Co", employerRating: 4.6, budget: 70000, location: "Nairobi", skills: ["Documentation", "Markdown", "Git", "API Docs"], postedDate: "2026-04-29", proposalCount: 18, deadline: "2026-06-03", description: "Create technical documentation and API guides. Strong writing and communication skills required." }
];

// Filter options
const CATEGORIES = ["All", "Frontend", "Backend", "Design", "DevOps", "Mobile", "Data Science", "Security", "Management"];
const LOCATIONS = ["All", "Nairobi", "Mombasa", "Kisumu", "Eldoret", "Remote"];

// ---------- APPLICATION STATE ----------
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
    sortBy: "newest"
};

// ---------- HELPER: Escape HTML (prevents XSS) ----------
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ---------- FORMAT CURRENCY ----------
function formatKES(amount) {
    return 'KES ' + amount.toLocaleString();
}

// ---------- FILTER AND SORT JOBS ----------
// WHY: Centralized filtering logic ensures consistent results across all UI interactions
function filterAndSortJobs() {
    let filtered = [...appState.jobs];
    
    // Search filter (title or employer)
    if (appState.searchTerm.trim()) {
        const term = appState.searchTerm.toLowerCase();
        filtered = filtered.filter(job => 
            job.title.toLowerCase().includes(term) ||
            job.employer.toLowerCase().includes(term)
        );
    }
    
    // Category filter (matches skills)
    if (appState.category !== "All") {
        filtered = filtered.filter(job => 
            job.skills.some(skill => 
                skill.toLowerCase().includes(appState.category.toLowerCase())
            )
        );
    }
    
    // Location filter
    if (appState.location !== "All") {
        filtered = filtered.filter(job => job.location === appState.location);
    }
    
    // Budget range filter
    filtered = filtered.filter(job => 
        job.budget >= appState.minBudget && job.budget <= appState.maxBudget
    );
    
    // Sorting
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
        default:
            break;
    }
    
    appState.filteredJobs = filtered;
    render();
}

// ---------- SIMULATE API CALL ----------
// WHY: 1.5s delay demonstrates loading skeleton state as required
function fetchJobs() {
    appState.isLoading = true;
    appState.error = null;
    render();
    
    // Simulate network delay (1.5 seconds)
    setTimeout(() => {
        // Set to false for normal operation, true to test error state
        const SIMULATE_ERROR = false;
        
        if (SIMULATE_ERROR) {
            appState.isLoading = false;
            appState.error = "Unable to connect to the server. Please check your internet connection and try again.";
            render();
        } else {
            appState.jobs = [...MOCK_JOBS];
            appState.isLoading = false;
            filterAndSortJobs();
        }
    }, 1500);
}

// ---------- RETRY FUNCTION FOR ERROR STATE ----------
function retryFetch() {
    fetchJobs();
}

// ---------- MODAL CONTROLS ----------
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

// ---------- PROPOSAL SUBMISSION WITH VALIDATION ----------
function submitProposal(event) {
    event.preventDefault();
    
    const coverLetter = document.getElementById('coverLetter').value;
    const proposedBudget = document.getElementById('proposedBudget').value;
    const timeline = document.getElementById('timeline').value;
    const portfolioUrl = document.getElementById('portfolioUrl').value;
    
    let errors = [];
    
    // Validation rules
    if (!coverLetter || coverLetter.trim().length < 100) {
        errors.push({ field: 'coverLetter', message: 'Cover letter must be at least 100 characters' });
    }
    if (!proposedBudget || parseFloat(proposedBudget) <= 0) {
        errors.push({ field: 'proposedBudget', message: 'Please enter a valid budget amount greater than 0' });
    }
    if (!timeline || parseInt(timeline) <= 0) {
        errors.push({ field: 'timeline', message: 'Please enter a valid timeline in days (minimum 1 day)' });
    }
    
    // Clear previous errors
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
    
    // Show confirmation state (mock submission - no real API)
    const formContainer = document.getElementById('proposalFormContainer');
    if (formContainer) {
        formContainer.innerHTML = `
            <div class="confirmation-state">
                <div class="empty-state-icon">✅</div>
                <h3>Proposal Submitted Successfully!</h3>
                <p>Your proposal for <strong>${escapeHtml(appState.selectedJob.title)}</strong> has been sent to ${escapeHtml(appState.selectedJob.employer)}.</p>
                <p style="margin-top: 1rem;">You will be notified when they review your application.</p>
                <button class="apply-btn" onclick="closeModal()" style="margin-top: 1rem; padding: 0.75rem 2rem;">Close</button>
            </div>
        `;
    }
}

// ---------- RENDER MODAL ----------
function renderModal() {
    if (!appState.isModalOpen || !appState.selectedJob) return;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('dynamicModal');
    if (existingModal) existingModal.remove();
    
    const job = appState.selectedJob;
    const modalHtml = `
        <div id="dynamicModal">
            <div class="modal-overlay" id="modalOverlay">
                <div class="modal-container" role="dialog" aria-modal="true" aria-label="Job Details">
                    <div class="modal-header">
                        <h2>${escapeHtml(job.title)}</h2>
                        <button class="modal-close" id="closeModalBtn" aria-label="Close">&times;</button>
                    </div>
                    <div class="modal-body">
                        <section>
                            <h3>📋 Job Details</h3>
                            <p><strong>🏢 Employer:</strong> ${escapeHtml(job.employer)} ★ ${job.employerRating}/5</p>
                            <p><strong>💰 Budget:</strong> ${formatKES(job.budget)}</p>
                            <p><strong>📍 Location:</strong> ${job.location}</p>
                            <p><strong>⏰ Deadline:</strong> ${job.deadline}</p>
                            <p><strong>📄 Description:</strong></p>
                            <p>${escapeHtml(job.description)}</p>
                            <p><strong>🛠️ Skills Required:</strong> ${job.skills.map(s => '#' + escapeHtml(s)).join(', ')}</p>
                        </section>
                        
                        <hr style="margin: 1.5rem 0;">
                        
                        <section id="proposalFormContainer">
                            <h3>📝 Submit Your Proposal</h3>
                            <form id="proposalForm" onsubmit="submitProposal(event)">
                                <div class="form-group">
                                    <label class="form-label" for="coverLetter">Cover Letter <span class="required">*</span></label>
                                    <textarea id="coverLetter" class="form-textarea" rows="5" placeholder="Explain why you're the best fit for this job... (minimum 100 characters)" required></textarea>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label" for="proposedBudget">Proposed Budget (KES) <span class="required">*</span></label>
                                    <input type="number" id="proposedBudget" class="form-input" placeholder="Your bid amount" required>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label" for="timeline">Timeline (Days) <span class="required">*</span></label>
                                    <input type="number" id="timeline" class="form-input" placeholder="How many days to complete?" required>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label" for="portfolioUrl">Portfolio URL (Optional)</label>
                                    <input type="url" id="portfolioUrl" class="form-input" placeholder="https://your-portfolio.com">
                                </div>
                                
                                <button type="submit" class="submit-btn">Submit Proposal</button>
                            </form>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Close modal on Escape key
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
    
    // Close on overlay click
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
    }
    
    // Close button
    const closeBtn = document.getElementById('closeModalBtn');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
}

// ---------- ATTACH EVENT LISTENERS ----------
function attachEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            appState.searchTerm = e.target.value;
            filterAndSortJobs();
        });
    }
    
    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            appState.category = e.target.value;
            filterAndSortJobs();
        });
    }
    
    // Location filter
    const locationFilter = document.getElementById('locationFilter');
    if (locationFilter) {
        locationFilter.addEventListener('change', (e) => {
            appState.location = e.target.value;
            filterAndSortJobs();
        });
    }
    
    // Budget filters
    const minBudget = document.getElementById('minBudget');
    const maxBudget = document.getElementById('maxBudget');
    if (minBudget) {
        minBudget.addEventListener('change', (e) => {
            appState.minBudget = parseInt(e.target.value) || 0;
            filterAndSortJobs();
        });
    }
    if (maxBudget) {
        maxBudget.addEventListener('change', (e) => {
            appState.maxBudget = parseInt(e.target.value) || 500000;
            filterAndSortJobs();
        });
    }
    
    // Sort dropdown
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            appState.sortBy = e.target.value;
            filterAndSortJobs();
        });
    }
    
    // Job card clicks and apply buttons
    document.querySelectorAll('.job-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('apply-btn')) return;
            const jobId = parseInt(card.getAttribute('data-job-id'));
            const job = appState.jobs.find(j => j.id === jobId);
            if (job) openJobModal(job);
        });
    });
    
    document.querySelectorAll('.apply-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const jobId = parseInt(btn.getAttribute('data-job-id'));
            const job = appState.jobs.find(j => j.id === jobId);
            if (job) openJobModal(job);
        });
    });
}

// ---------- MAIN RENDER FUNCTION ----------
function render() {
    const root = document.getElementById('root');
    if (!root) return;
    
    // LOADING STATE
    if (appState.isLoading) {
        root.innerHTML = `
            <div class="app-container">
                <header class="sticky-header">
                    <a href="#" class="logo">Homeland<span>Jobs</span></a>
                    <ul class="nav-links">
                        <li><a href="#">Home</a></li>
                        <li><a href="#">Jobs</a></li>
                        <li><a href="#">Post a Job</a></li>
                        <li><a href="#">Sign In</a></li>
                    </ul>
                </header>
                <main class="main-content">
                    <div class="job-grid">
                        ${Array(6).fill().map(() => `
                            <div class="skeleton-card">
                                <div class="skeleton-title"></div>
                                <div class="skeleton-text"></div>
                                <div class="skeleton-text short"></div>
                                <div class="skeleton-text medium"></div>
                            </div>
                        `).join('')}
                    </div>
                </main>
            </div>
        `;
        return;
    }
    
    // ERROR STATE with Retry button
    if (appState.error) {
        root.innerHTML = `
            <div class="app-container">
                <header class="sticky-header">
                    <a href="#" class="logo">Homeland<span>Jobs</span></a>
                    <ul class="nav-links">
                        <li><a href="#">Home</a></li>
                        <li><a href="#">Jobs</a></li>
                        <li><a href="#">Post a Job</a></li>
                        <li><a href="#">Sign In</a></li>
                    </ul>
                </header>
                <main class="main-content">
                    <div class="error-state">
                        <div class="empty-state-icon">⚠️</div>
                        <h2>Something went wrong</h2>
                        <p>${escapeHtml(appState.error)}</p>
                        <button class="retry-btn" onclick="retryFetch()">⟳ Retry</button>
                    </div>
                </main>
            </div>
        `;
        return;
    }
    
    // Filter section HTML
    const jobStatsText = `Showing <strong>${appState.filteredJobs.length}</strong> of <strong>${appState.jobs.length}</strong> jobs`;
    
    const filterHtml = `
        <div class="filters-section">
            <input type="text" class="search-bar" placeholder="🔍 Search jobs by title or employer..." id="searchInput" value="${escapeHtml(appState.searchTerm)}">
            <div class="filter-group">
                <select class="filter-select" id="categoryFilter">
                    ${CATEGORIES.map(cat => `<option value="${cat}" ${appState.category === cat ? 'selected' : ''}>📁 ${cat}</option>`).join('')}
                </select>
                <select class="filter-select" id="locationFilter">
                    ${LOCATIONS.map(loc => `<option value="${loc}" ${appState.location === loc ? 'selected' : ''}>📍 ${loc}</option>`).join('')}
                </select>
                <input type="number" class="budget-input" placeholder="Min Budget (KES)" id="minBudget" value="${appState.minBudget}">
                <input type="number" class="budget-input" placeholder="Max Budget (KES)" id="maxBudget" value="${appState.maxBudget}">
                <select class="sort-dropdown" id="sortSelect">
                    <option value="newest" ${appState.sortBy === 'newest' ? 'selected' : ''}>📅 Newest First</option>
                    <option value="budget-high-low" ${appState.sortBy === 'budget-high-low' ? 'selected' : ''}>💰 Budget: High to Low</option>
                    <option value="budget-low-high" ${appState.sortBy === 'budget-low-high' ? 'selected' : ''}>💰 Budget: Low to High</option>
                </select>
            </div>
        </div>
        <div class="job-stats">${jobStatsText}</div>
    `;
    
    // EMPTY STATE
    if (appState.filteredJobs.length === 0) {
        root.innerHTML = `
            <div class="app-container">
                <header class="sticky-header">
                    <a href="#" class="logo">Homeland<span>Jobs</span></a>
                    <ul class="nav-links">
                        <li><a href="#">Home</a></li>
                        <li><a href="#">Jobs</a></li>
                        <li><a href="#">Post a Job</a></li>
                        <li><a href="#">Sign In</a></li>
                    </ul>
                </header>
                <main class="main-content">
                    ${filterHtml}
                    <div class="empty-state">
                        <div class="empty-state-icon">🔍</div>
                        <h3>No jobs found</h3>
                        <p>Try adjusting your filters or search term</p>
                    </div>
                </main>
                <footer class="app-footer">
                    <address>📧 support@homelandjobs.co.ke | 📍 Nairobi, Kenya</address>
                    <div class="copyright">
                        <p>&copy; 2026 Homeland Jobs. All rights reserved. | Developed by Oula Paul (HEH/DK1/007)</p>
                    </div>
                </footer>
            </div>
        `;
        attachEventListeners();
        return;
    }
    
    // JOB CARDS HTML
    const jobCardsHtml = appState.filteredJobs.map(job => `
        <article class="job-card" data-job-id="${job.id}">
            <h3 class="job-title">${escapeHtml(job.title)}</h3>
            <div class="employer-name">🏢 ${escapeHtml(job.employer)} ★ ${job.employerRating}</div>
            <div class="job-budget">💰 ${formatKES(job.budget)}</div>
            <div class="job-location">📍 ${job.location}</div>
            <div class="skills-tags">
                ${job.skills.map(skill => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join('')}
            </div>
            <div class="job-meta">
                <time class="posted-date" datetime="${job.postedDate}">📅 ${new Date(job.postedDate).toLocaleDateString('en-GB')}</time>
                <span class="proposal-count">📄 ${job.proposalCount} proposals</span>
                <button class="apply-btn" data-job-id="${job.id}">Apply Now</button>
            </div>
        </article>
    `).join('');
    
    root.innerHTML = `
        <div class="app-container">
            <header class="sticky-header">
                <a href="#" class="logo">Homeland<span>Jobs</span></a>
                <ul class="nav-links">
                    <li><a href="#">Home</a></li>
                    <li><a href="#">Jobs</a></li>
                    <li><a href="#">Post a Job</a></li>
                    <li><a href="#">Sign In</a></li>
                </ul>
            </header>
            <main class="main-content">
                ${filterHtml}
                <div class="job-grid" id="jobGrid">
                    ${jobCardsHtml}
                </div>
            </main>
            <footer class="app-footer">
                <address>📧 support@homelandjobs.co.ke | 📍 Nairobi, Kenya</address>
                <div class="copyright">
                    <p>&copy; 2026 Homeland Jobs. All rights reserved. | Developed by Oula Paul (HEH/DK1/007)</p>
                </div>
            </footer>
        </div>
    `;
    
    attachEventListeners();
}

// ---------- INITIALIZE APP ----------
fetchJobs();