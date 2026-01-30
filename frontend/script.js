async function parseResume() {
    const fileInput = document.getElementById('resumeFile');
    const file = fileInput.files[0];
    const parseBtn = document.getElementById('parseBtn');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const resultsDiv = document.getElementById('results');

    if (!file) {
        alert("Please select a file first.");
        return;
    }

    // Reset UI
    errorDiv.textContent = "";
    errorDiv.classList.add('hidden');
    resultsDiv.classList.add('hidden');
    loadingDiv.classList.remove('hidden');
    parseBtn.disabled = true;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('http://localhost:8000/parse-resume', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to parse resume');
        }

        const data = await response.json();
        populateUI(data);
        resultsDiv.classList.remove('hidden');

    } catch (err) {
        errorDiv.textContent = err.message;
        errorDiv.classList.remove('hidden');
    } finally {
        loadingDiv.classList.add('hidden');
        parseBtn.disabled = false;
    }
}

function populateUI(data) {
    // Header Info
    setVal('fullNameDisplay', data.full_name);
    setVal('emailDisplay', data.email);
    setVal('phoneDisplay', data.phone_number);
    setVal('locationDisplay', data.location);
    setVal('totalExpDisplay', data.total_years_of_experience);
    
    // Infer a job title from the most recent experience if possible
    let displayTitle = 'Professional Candidate';
    if (data.work_experience && data.work_experience.length > 0) {
        displayTitle = data.work_experience[0].job_title || 'Professional Candidate';
    }
    document.getElementById('titleDisplay').textContent = displayTitle;

    // Summary
    setVal('summaryDisplay', data.professional_summary);

    // Categorized Skills
    const techSkills = data.technical_skills || {};
    setVal('skillsLanguages', joinSkills(techSkills.languages));
    setVal('skillsDevTools', joinSkills(techSkills.developer_tools));
    setVal('skillsFrameworks', joinSkills(techSkills.frameworks));
    setVal('skillsDatabases', joinSkills(techSkills.databases));
    setVal('skillsSoft', joinSkills(techSkills.soft_skills));
    setVal('skillsCoursework', joinSkills(techSkills.coursework));
    setVal('skillsInterests', joinSkills(techSkills.areas_of_interest));

    // Education
    const eduList = document.getElementById('educationList');
    eduList.innerHTML = '';
    if (data.education && Array.isArray(data.education) && data.education.length > 0) {
        data.education.forEach(edu => {
            const div = document.createElement('div');
            div.className = 'edu-card';
            div.innerHTML = `
                <input type="text" class="std-input bold" value="${edu.degree || ''}" placeholder="Degree">
                <input type="text" class="std-input" value="${edu.institution || ''}" placeholder="Institution">
                <input type="text" class="std-input" value="${edu.year || ''}" placeholder="Year">
            `;
            eduList.appendChild(div);
        });
    } else {
        addEmptyEducation(eduList);
    }

    // Work Experience
    const expList = document.getElementById('experienceList');
    expList.innerHTML = '';
    if (data.work_experience && Array.isArray(data.work_experience) && data.work_experience.length > 0) {
        data.work_experience.forEach(exp => {
            addExperienceItem(exp);
        });
    } else {
         addEmptyExperience(expList);
    }
    
    // Position of Responsibility (POR)
    const porList = document.getElementById('porList');
    porList.innerHTML = '';
    if (data.position_of_responsibility && Array.isArray(data.position_of_responsibility) && data.position_of_responsibility.length > 0) {
        data.position_of_responsibility.forEach(por => {
            addPorItem(por);
        });
    } else {
        porList.innerHTML = ''; // Clear for manual add
    }

    // Projects
    const projList = document.getElementById('projectList');
    projList.innerHTML = '';
    if (data.projects && Array.isArray(data.projects) && data.projects.length > 0) {
        data.projects.forEach(proj => {
            addProjectItem(proj);
        });
    } else {
         addEmptyProject(projList);
    }

    // Achievements
    let achievementsText = "";
    if (data.achievements) {
        if (Array.isArray(data.achievements)) {
            achievementsText = data.achievements.join('\n');
        } else {
            achievementsText = data.achievements;
        }
    }
    setVal('achievementsInput', achievementsText);
}

function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
}

function joinSkills(skillsArr) {
    if (Array.isArray(skillsArr)) {
        return skillsArr.join(', ');
    }
    return skillsArr || '';
}

function verifyData() {
    // In a real app, this would gather all inputs and send them to the server
    // For this demo, we'll just show a confirmation
    alert("Data verified and confirmed! (In a real app, this would be saved to a database).");
}

// --- Dynamic Item Adding Functions ---

function addExperienceItem(data = {}) {
    const list = document.getElementById('experienceList');
    const div = document.createElement('div');
    div.className = 'timeline-item';
    div.innerHTML = `
        <div class="timeline-header">
            <input type="text" class="std-input bold" value="${data.job_title || ''}" placeholder="Job Title">
            <input type="text" class="std-input" value="${data.company || ''}" placeholder="Company">
        </div>
        <div class="timeline-dates">
             <input type="text" class="std-input" value="${data.start_date || ''}" placeholder="Start">
             <span>-</span>
             <input type="text" class="std-input" value="${data.end_date || ''}" placeholder="End">
        </div>
        <textarea class="std-textarea" rows="3" placeholder="Responsibilities">${data.responsibilities || ''}</textarea>
        <button class="remove-btn" onclick="this.parentElement.remove()">Remove</button>
    `;
    list.appendChild(div);
}

function addPorItem(data = {}) {
    const list = document.getElementById('porList');
    const div = document.createElement('div');
    div.className = 'timeline-item';
    div.innerHTML = `
        <div class="timeline-header">
            <input type="text" class="std-input bold" value="${data.title || ''}" placeholder="Position Title">
            <input type="text" class="std-input" value="${data.organization || ''}" placeholder="Organization">
        </div>
         <div class="timeline-dates">
             <input type="text" class="std-input" value="${data.duration || ''}" placeholder="Duration">
        </div>
        <textarea class="std-textarea" rows="2" placeholder="Description">${data.description || ''}</textarea>
        <button class="remove-btn" onclick="this.parentElement.remove()">Remove</button>
    `;
    list.appendChild(div);
}

function addProjectItem(data = {}) {
    const list = document.getElementById('projectList');
    const div = document.createElement('div');
    div.className = 'project-card';
    div.innerHTML = `
        <input type="text" class="std-input bold" value="${data.title || ''}" placeholder="Project Title">
        <textarea class="std-textarea" rows="3" placeholder="Description">${data.description || ''}</textarea>
        <input type="text" class="std-input small" value="${data.technologies || ''}" placeholder="Technologies">
        <button class="remove-btn" onclick="this.parentElement.remove()">Remove</button>
    `;
    list.appendChild(div);
}

function addEducationItem(data = {}) {
    const list = document.getElementById('educationList');
    const div = document.createElement('div');
    div.className = 'edu-card';
    div.innerHTML = `
        <input type="text" class="std-input bold" value="${data.degree || ''}" placeholder="Degree">
        <input type="text" class="std-input" value="${data.institution || ''}" placeholder="Institution">
        <input type="text" class="std-input" value="${data.year || ''}" placeholder="Year">
        <button class="remove-btn" onclick="this.parentElement.remove()">Remove</button>
    `;
    list.appendChild(div);
}

// Drag and drop handling
const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('resumeFile');
const fileMsg = document.querySelector('.file-msg');

dropArea.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        fileMsg.textContent = e.target.files[0].name;
    }
});

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    dropArea.classList.add('highlight');
}

function unhighlight(e) {
    dropArea.classList.remove('highlight');
}

dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    fileInput.files = files;
    if (files.length > 0) {
        fileMsg.textContent = files[0].name;
    }
}

// Helpers for empty states (could add buttons to add new items dynamically)
function addEmptyEducation(container) {
    container.innerHTML = '<p class="text-muted">No education found. Add manually if needed.</p>';
}
function addEmptyExperience(container) {
    container.innerHTML = '<p class="text-muted">No experience found. Add manually if needed.</p>';
}
function addEmptyProject(container) {
    container.innerHTML = '<p class="text-muted">No projects found. Add manually if needed.</p>';
}
