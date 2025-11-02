/**
 * Job Listings Application - Complete Code (Without CRUD)
 * 
 * Complete job listings management application with all functionality implemented.
 * 
 * Features:
 * - Load and display job listings from data.json
 * - Search and filter functionality
 * - Tab navigation (Profile, Favorites)
 * - Favorites system (in-memory)
 * - Form validation
 * - Modal dialogs
 * - User profile management
 */

document.addEventListener('DOMContentLoaded', () => {

    // ------------------------------------
    // --- GLOBAL VARIABLES ---
    // ------------------------------------

    let allJobs = [];
    let manualFilters = [];
    let userProfile = { name: '', position: '', skills: [] };
    let favoriteJobIds = [];

    // DOM Elements
    const jobListingsContainer = document.getElementById('job-listings-container');
    const filterTagsContainer = document.getElementById('filter-tags-container');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const searchInput = document.getElementById('search-input');
    const statsCounter = document.getElementById('stats-counter');
    const filterBar = document.getElementById('filter-bar');

    const profileForm = document.getElementById('profile-form');
    const profileNameInput = document.getElementById('profile-name');
    const profilePositionInput = document.getElementById('profile-position');
    const skillInput = document.getElementById('skill-input');
    const profileSkillsList = document.getElementById('profile-skills-list');

    const tabsNav = document.querySelector('.tabs-nav');
    const tabContents = document.querySelectorAll('.tab-content');

    const favoriteJobsContainer = document.getElementById('favorite-jobs-container');
    const favoritesCount = document.getElementById('favorites-count');

    const manageJobsList = document.getElementById('manage-jobs-list');

    const viewModal = document.getElementById('job-modal');
    const viewModalCloseBtn = document.getElementById('modal-close-btn-view');

    // ------------------------------------
    // --- DATA MANAGEMENT ---
    // ------------------------------------

    const loadAllJobs = async () => {
        try {
            const response = await fetch('./assets/data/data.json');
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            allJobs = await response.json();
        } catch (error) {
            console.error("Error loading data:", error);
            jobListingsContainer.innerHTML = '<p class="job-listings__empty">Error loading job data.</p>';
        }
    };

    // ------------------------------------
    // --- FORM VALIDATION ---
    // ------------------------------------

    const showError = (input, message) => {
        input.classList.add('has-error');
        const errorSpan = input.nextElementSibling;
        if (errorSpan && errorSpan.classList.contains('form-error')) {
            errorSpan.style.display = "block";
            errorSpan.textContent = message;
        }
    };

    const clearErrors = (form) => {
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.classList.remove('has-error');
            const err = input.nextElementSibling;
            if (err && err.classList.contains('form-error')) {
                err.textContent = '';
                err.style.display = 'none';
            }
        });
    };

    const validateProfileForm = () => {
        clearErrors(profileForm);
        let isValid = true;

        const name = profileNameInput.value.trim();
        const position = profilePositionInput.value.trim();

        if (!name) {
            showError(profileNameInput, 'Le nom complet est requis');
            isValid = false;
        } else if (name.length < 3) {
            showError(profileNameInput, 'Le nom doit contenir au moins 3 caractères');
            isValid = false;
        }

        if (!position) {
            showError(profilePositionInput, 'Le poste souhaité est requis');
            isValid = false;
        } else if (position.length < 3) {
            showError(profilePositionInput, 'Le poste doit contenir au moins 3 caractères');
            isValid = false;
        }

        return isValid;
    };

    // ------------------------------------
    // --- PROFILE MANAGEMENT ---
    // ------------------------------------

    const renderProfileSkills = () => {
        profileSkillsList.innerHTML = '';
        
        if (!userProfile.skills || userProfile.skills.length === 0) {
            profileSkillsList.innerHTML = '<li class="empty-message">Aucune compétence ajoutée</li>';
            return;
        }

        userProfile.skills.forEach(skill => {
            const skillItem = document.createElement('li');
            skillItem.className = 'profile-skill-tag';
            skillItem.dataset.skill = skill;

            skillItem.innerHTML = `
                <span>${skill}</span>
                <button class="profile-skill-remove" aria-label="Remove skill ${skill}">✕</button>
            `;

            const removeBtn = skillItem.querySelector('.profile-skill-remove');
            removeBtn.addEventListener('click', () => {
                userProfile.skills = userProfile.skills.filter(s => s !== skill);
                renderProfileSkills();
                applyAllFilters();
            });
            
            profileSkillsList.appendChild(skillItem);
        });
    };

    const renderProfileForm = () => {
        if (profileNameInput) {
            profileNameInput.value = userProfile.name || '';
        }
        if (profilePositionInput) {
            profilePositionInput.value = userProfile.position || '';
        }
        renderProfileSkills();
    };

    const handleProfileSave = (e) => {
        e.preventDefault();
        
        if (!validateProfileForm()) return;

        userProfile.name = profileNameInput.value.trim();
        userProfile.position = profilePositionInput.value.trim();
        
        alert('Profil sauvegardé avec succès !');
        applyAllFilters();
    };

    const handleSkillAdd = (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        
        const skill = skillInput.value.trim();
        if (!skill) return;
        
        if (userProfile.skills.includes(skill)) {
            alert('Cette compétence existe déjà !');
            return;
        }
        
        userProfile.skills.push(skill);
        renderProfileSkills();
        skillInput.value = '';
        applyAllFilters();
    };

    // ------------------------------------
    // --- FAVORITES MANAGEMENT ---
    // ------------------------------------

    const renderFavoritesCount = () => {
        favoritesCount.textContent = `(${favoriteJobIds.length})`;
    };

    const renderFavoriteJobs = () => {
        if (favoriteJobIds.length === 0) {
            favoriteJobsContainer.innerHTML = '<p class="job-listings__empty">Aucun favori pour le moment.</p>';
            return;
        }

        const favoriteJobs = allJobs.filter(job => favoriteJobIds.includes(job.id));
        favoriteJobsContainer.innerHTML = favoriteJobs.map(createJobCardHTML).join('');
        attachFavoriteListeners();
    };

    const toggleFavorite = (jobId) => {
        const index = favoriteJobIds.indexOf(jobId);
        
        if (index !== -1) {
            favoriteJobIds.splice(index, 1);
        } else {
            favoriteJobIds.push(jobId);
        }
        
        renderFavoritesCount();
        renderFavoriteJobs();
        applyAllFilters();
    };

    // ------------------------------------
    // --- TAB NAVIGATION ---
    // ------------------------------------

    const setupTabs = () => {
        tabsNav.addEventListener('click', (e) => {
            const clickedTab = e.target.closest('.tab-item');
            if (!clickedTab) return;

            tabsNav.querySelectorAll('.tab-item').forEach(tab => 
                tab.classList.remove('tab-item--active')
            );
            clickedTab.classList.add('tab-item--active');

            const tabId = clickedTab.dataset.tab;
            tabContents.forEach(content => {
                content.classList.toggle('tab-content--active', content.id === `tab-${tabId}`);
            });

            if (tabId === 'favorites') renderFavoriteJobs();
            if (tabId === 'manage') renderManageList();
        });
    };

    // ------------------------------------
    // --- MODAL MANAGEMENT ---
    // ------------------------------------

    const openViewModal = (jobId) => {
        const job = allJobs.find(j => j.id === jobId);
        if (!job) return;

        document.getElementById('modal-logo').src = job.logo ;
        document.getElementById('modal-position').textContent = job.position;
        document.getElementById('modal-company').textContent = job.company;
        document.getElementById('modal-description').textContent = job.description;
        document.getElementById('modal-meta').innerHTML = 
            `<li>${job.postedAt}</li><li>${job.contract}</li><li>${job.location}</li>`;
        
        const tags = [job.role, job.level, ...(job.skills || [])];
        document.getElementById('modal-tags').innerHTML = 
            tags.map(tag => `<span class="job-card__tag">${tag}</span>`).join('');
        
        viewModal.style.display = 'flex';
    };

    const closeViewModal = () => {
        viewModal.style.display = 'none';
    };

    // ------------------------------------
    // --- JOB MANAGEMENT ---
    // ------------------------------------

    const renderManageList = () => {
        if (allJobs.length === 0) {
            manageJobsList.innerHTML = '<li class="manage-job-item"><p>Aucune offre disponible.</p></li>';
            return;
        }

        manageJobsList.innerHTML = allJobs.map(job => `
            <li class="manage-job-item" data-job-id="${job.id}">
                <img src="${job.logo}" 
                     alt="" 
                     class="job-card__logo" 
                     style="position: static; width: 48px; height: 48px; border-radius: 5px;">
                <div class="manage-job-item__info">
                    <h4>${job.position}</h4>
                    <p>${job.company} - ${job.location}</p>
                </div>
                <div class="manage-job-item__actions">
                    <button class="btn btn--secondary btn-edit">Modifier</button>
                    <button class="btn btn--danger btn-delete">Supprimer</button>
                </div>
            </li>
        `).join('');
    };

    // ------------------------------------
    // --- JOB RENDERING ---
    // ------------------------------------

    const createJobCardHTML = (job) => {
        const { id, company, logo, new: isNew, featured, position, role, level, postedAt, contract, location, skills } = job;
        const tags = [role, level, ...(skills || [])];
        const tagsHTML = tags.map(tag => `<span class="job-card__tag" data-tag="${tag}">${tag}</span>`).join('');
        const newBadge = isNew ? '<span class="job-card__badge job-card__badge--new">NEW!</span>' : '';
        const featuredBadge = featured ? '<span class="job-card__badge job-card__badge--featured">FEATURED</span>' : '';
        const featuredClass = featured ? 'job-card--featured' : '';

        const isFavorite = favoriteJobIds.includes(id);
        const favoriteClass = isFavorite ? 'job-card__favorite-btn--active' : '';
        const favoriteIcon = isFavorite ? '★' : '☆';

        return `
            <article class="job-card ${featuredClass}" data-job-id="${id}" data-tags="${tags.join(',')}">
                <button class="job-card__favorite-btn ${favoriteClass}" data-job-id="${id}" aria-label="Add to favorites">
                    ${favoriteIcon}
                </button>
                <img src="${logo}" alt="${company} logo" class="job-card__logo">
                <div class="job-card__info">
                    <div class="job-card__company"><span>${company}</span>${newBadge}${featuredBadge}</div>
                    <h2 class="job-card__position">${position}</h2>
                    <ul class="job-card__meta"><li>${postedAt}</li><li>${contract}</li><li>${location}</li></ul>
                </div>
                <div class="job-card__tags">${tagsHTML}</div>
            </article>
        `;
    };

    const renderJobs = (jobsToRender) => {
        jobListingsContainer.innerHTML = jobsToRender.length > 0
            ? jobsToRender.map(createJobCardHTML).join('')
            : '<p class="job-listings__empty">Aucune offre ne correspond à votre recherche.</p>';

        attachJobListeners();
        renderStats(jobsToRender.length, allJobs.length);
    };

    const attachFavoriteListeners = () => {
        const favoriteButtons = document.querySelectorAll('.job-card__favorite-btn');
        favoriteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const jobId = parseInt(e.currentTarget.dataset.jobId);
                toggleFavorite(jobId);
            });
        });
    };

    const attachJobListeners = () => {
        attachFavoriteListeners();

        const jobCards = document.querySelectorAll('.job-card');
        jobCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.job-card__favorite-btn')) return;
                if (e.target.closest('.job-card__tag')) {
                    const tag = e.target.dataset.tag;
                    if (tag && !manualFilters.includes(tag)) {
                        manualFilters.push(tag);
                        applyAllFilters();
                    }
                    return;
                }
                const jobId = parseInt(card.dataset.jobId);
                openViewModal(jobId);
            });
        });
    };

    const renderManualFilterTags = () => {
        if (manualFilters.length === 0) {
            filterTagsContainer.innerHTML = '';
            return;
        }
        
        filterTagsContainer.innerHTML = manualFilters.map(tag => `
            <div class="filter-bar__tag" data-tag="${tag}">
                <span class="filter-bar__tag-name">${tag}</span>
                <button class="filter-bar__tag-remove" aria-label="Remove filter ${tag}">✕</button>
            </div>
        `).join('');

        attachFilterListeners();
    };

    const attachFilterListeners = () => {
        const removeButtons = filterTagsContainer.querySelectorAll('.filter-bar__tag-remove');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tag = e.target.closest('.filter-bar__tag').dataset.tag;
                manualFilters = manualFilters.filter(f => f !== tag);
                applyAllFilters();
            });
        });
    };

    const renderStats = (matchCount, totalCount) => {
        if (manualFilters.length === 0 && !searchInput.value.trim() && userProfile.skills.length === 0) {
            statsCounter.textContent = `${totalCount} offre${totalCount > 1 ? 's' : ''} disponible${totalCount > 1 ? 's' : ''}`;
        } else {
            statsCounter.textContent = `${matchCount} offre${matchCount > 1 ? 's' : ''} trouvée${matchCount > 1 ? 's' : ''} sur ${totalCount}`;
        }
    };

    // ------------------------------------
    // --- FILTERING & SEARCH ---
    // ------------------------------------

    const applyAllFilters = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        const allFilterTags = [...new Set([...userProfile.skills, ...manualFilters])];

        let filtered = allJobs;

        if (allFilterTags.length > 0) {
            filtered = filtered.filter(job => {
                const jobTags = [job.role, job.level, ...(job.skills || [])];
                return allFilterTags.every(filterTag => 
                    jobTags.some(jobTag => jobTag.toLowerCase() === filterTag.toLowerCase())
                );
            });
        }

        if (searchTerm) {
            filtered = filtered.filter(job => {
                const searchableText = [
                    job.company,
                    job.position,
                    job.location,
                    job.role,
                    job.contract,
                    ...(job.skills || [])
                ].join(' ').toLowerCase();
                
                return searchableText.includes(searchTerm);
            });
        }

        renderJobs(filtered);
        renderManualFilterTags();
    };

    // ------------------------------------
    // --- EVENT HANDLERS ---
    // ------------------------------------

    const handleClearFilters = () => {
        manualFilters = [];
        searchInput.value = '';
        applyAllFilters();
    };

    // ------------------------------------
    // --- INITIALIZATION ---
    // ------------------------------------

    const initializeApp = async () => {
        await loadAllJobs();

        renderProfileForm();
        renderFavoritesCount();
        setupTabs();

        viewModalCloseBtn.addEventListener('click', closeViewModal);
        viewModal.addEventListener('click', (e) => { 
            if (e.target === viewModal) closeViewModal(); 
        });

        profileForm.addEventListener('submit', handleProfileSave);
        skillInput.addEventListener('keydown', handleSkillAdd);

        searchInput.addEventListener('input', applyAllFilters);
        clearFiltersBtn.addEventListener('click', handleClearFilters);

        applyAllFilters();
    };

    initializeApp();
});