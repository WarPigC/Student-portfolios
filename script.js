document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const studentContainer = document.getElementById('studentContainer');
    const searchInput = document.getElementById('searchInput');
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const noResultsMsg = document.getElementById('noResultsMsg');

    let allStudents = [];
    let currentlyExpandedWrapper = null;

    // Fetch student data
    async function fetchStudents() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) throw new Error('Failed to load student data');
            allStudents = await response.json();
            renderStudents(allStudents);
        } catch (error) {
            console.error('Error fetching data:', error);
            studentContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 40px;">
                    <i class="ph ph-warning" style="font-size: 3rem; margin-bottom: 16px;"></i>
                    <p>Failed to load student data. Please ensure you are running a local server.</p>
                </div>
            `;
        }
    }

    // Get initials for avatar
    function getInitials(name) {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        return name.substring(0, 2).toUpperCase();
    }

    function collapseCurrentCard() {
        if (currentlyExpandedWrapper) {
            const wrapper = currentlyExpandedWrapper;
            wrapper.classList.remove('is-expanded');
            wrapper.classList.add('is-closing');
            setTimeout(() => {
                wrapper.classList.remove('is-closing');
            }, 400); // Wait for CSS transitions to finish
            currentlyExpandedWrapper = null;
        }
    }

    // ===========================
    // Card Creation
    // ===========================

    function createStudentCard(student, index) {
        const wrapper = document.createElement('div');
        wrapper.className = 'card-wrapper';
        
        const card = document.createElement('div');
        card.className = 'student-card';
        card.style.opacity = '0';
        card.style.animationDelay = `${index * 0.05}s`;
        card.classList.add('animate-in');

        const initials = getInitials(student.name);
        const hasMatlab = student.matlabCert && student.matlabCert !== '#';
        const hasBlog = student.blogLink && student.blogLink !== '#';
        const hasGithub = student.githubLink && student.githubLink !== '#';
        const hasProjectLink = student.projectLink && student.projectLink !== '';

        card.innerHTML = `
            <button class="close-card-btn" aria-label="Close"><i class="ph ph-x"></i></button>

            <div class="card-header">
                <div class="avatar">${initials}</div>
                <div class="basic-info">
                    <h2>${student.name}</h2>
                    <span class="enrollment">${student.enrollment}</span>
                </div>
            </div>

            <div class="card-preview">
                <div class="preview-label">ML Project</div>
                <div class="preview-title">${student.projectTitle}</div>
            </div>

            <div class="list-quick-info">
                <div class="email-mini"><i class="ph ph-envelope-simple"></i> ${student.email}</div>
                <div class="badge-row">
                    ${hasMatlab ? '<i class="ph ph-certificate" title="MATLAB Certified"></i>' : ''}
                    ${hasBlog ? '<i class="ph ph-article" title="Has Blog"></i>' : ''}
                    ${hasGithub ? '<i class="ph ph-github-logo" title="Has GitHub"></i>' : ''}
                </div>
            </div>
            
            <div class="card-details">
                <div class="details-content-wrapper">
                    <div class="details-content">
                        <div class="email-display">
                            <i class="ph ph-envelope-simple"></i>
                            <a href="mailto:${student.email}">${student.email}</a>
                        </div>
                        
                        <div class="project-info">
                            <div class="project-label">ML Project</div>
                            <div class="project-title">${student.projectTitle}</div>
                            ${hasProjectLink ? `<a href="${student.projectLink}" target="_blank" rel="noopener noreferrer" class="project-link" onclick="event.stopPropagation();">
                                <i class="ph ph-link"></i> View Deployment
                            </a>` : ''}
                        </div>

                        <div class="action-buttons">
                            <a href="${hasMatlab ? student.matlabCert : '#'}" target="_blank" rel="noopener noreferrer" 
                               class="action-btn btn-matlab ${!hasMatlab ? 'disabled' : ''}" 
                               onclick="event.stopPropagation(); ${!hasMatlab ? 'event.preventDefault();' : ''}">
                                <i class="ph ph-certificate"></i> MATLAB Cert
                            </a>
                            <a href="${hasBlog ? student.blogLink : '#'}" target="_blank" rel="noopener noreferrer" 
                               class="action-btn btn-blog ${!hasBlog ? 'disabled' : ''}" 
                               onclick="event.stopPropagation(); ${!hasBlog ? 'event.preventDefault();' : ''}">
                                <i class="ph ph-article"></i> Blog
                            </a>
                            <a href="${hasGithub ? student.githubLink : '#'}" target="_blank" rel="noopener noreferrer" 
                               class="action-btn btn-github ${!hasGithub ? 'disabled' : ''}" 
                               onclick="event.stopPropagation(); ${!hasGithub ? 'event.preventDefault();' : ''}">
                                <i class="ph ph-github-logo"></i> GitHub
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        wrapper.appendChild(card);

        // Click on card to expand
        card.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn') || e.target.closest('.project-link')) return;
            if (e.target.closest('.close-card-btn')) {
                e.stopPropagation();
                collapseCurrentCard();
                return;
            }

            if (wrapper.classList.contains('is-expanded')) {
                collapseCurrentCard();
            } else {
                collapseCurrentCard();
                wrapper.classList.add('is-expanded');
                currentlyExpandedWrapper = wrapper;
            }
        });

        return wrapper;
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') collapseCurrentCard();
    });

    // Close when clicking outside of any expanded card
    document.addEventListener('click', (e) => {
        if (currentlyExpandedWrapper && !e.target.closest('.card-wrapper')) {
            collapseCurrentCard();
        }
    });

    // Render students
    function renderStudents(studentsToRender) {
        collapseCurrentCard();
        studentContainer.innerHTML = '';
        
        if (studentsToRender.length === 0) {
            noResultsMsg.classList.remove('hidden');
            return;
        }
        
        noResultsMsg.classList.add('hidden');
        
        studentsToRender.forEach((student, index) => {
            const wrapper = createStudentCard(student, index);
            studentContainer.appendChild(wrapper);
        });
    }

    // Search
    function handleSearch() {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) {
            renderStudents(allStudents);
            return;
        }
        const filtered = allStudents.filter(s =>
            s.name.toLowerCase().includes(query) || s.enrollment.toLowerCase().includes(query)
        );
        renderStudents(filtered);
    }

    // View toggling
    function setView(viewType) {
        collapseCurrentCard();
        if (viewType === 'grid') {
            studentContainer.classList.remove('list-view');
            studentContainer.classList.add('grid-view');
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
        } else {
            studentContainer.classList.remove('grid-view');
            studentContainer.classList.add('list-view');
            listViewBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
        }
    }

    // Event Listeners
    searchInput.addEventListener('input', handleSearch);
    gridViewBtn.addEventListener('click', () => setView('grid'));
    listViewBtn.addEventListener('click', () => setView('list'));

    // Set default view based on screen width
    function setDefaultView() {
        if (window.innerWidth <= 768) {
            setView('list');
        } else {
            setView('grid');
        }
    }

    // Init
    setDefaultView();
    fetchStudents();
});
