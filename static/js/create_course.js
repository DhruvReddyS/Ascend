// === Toast Notification ===
function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// === Fade-in Animation ===
function animateElementFadeIn(el) {
  el.style.opacity = 0;
  el.style.transition = 'opacity 0.4s ease';
  requestAnimationFrame(() => {
    el.style.opacity = 1;
  });
}

// === Tab Switching ===
function switchTab(index) {
  const tabs = document.querySelectorAll('.tab');
  const sections = document.querySelectorAll('.tab-section');
  const currentIndex = Array.from(sections).findIndex(s => s.classList.contains('active'));

  // Validate only if moving forward
  if (index > currentIndex) {
    if (!validateTab(currentIndex)) return;
  }

  // === 👇 DEFER populateContentTab till AFTER DOM is updated
  tabs.forEach(t => t.classList.remove('active'));
  sections.forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });

  tabs[index].classList.add('active');
  sections[index].classList.add('active');
  sections[index].style.display = 'block';
  animateElementFadeIn(sections[index]);

  // Trigger dynamic content once it's visible
  setTimeout(() => {
    if (index === 2) populateContentTab();
    if (index === 3) populateFinalPreview();
  }, 10);
}

// === Tab Validation ===
function validateTab(index) {
  const errors = [];

  if (index === 0) {
    const fields = [
      ['course_title', 'Course title is required.'],
      ['description', 'Description is required.'],
      ['difficulty', 'Select difficulty.'],
      ['category', 'Choose a category.'],
      ['language', 'Choose a language.'],
      ['thumbnail', 'Upload a thumbnail.'],
      ['prerequisites', 'Enter prerequisites.'],
      ['learning_objectives', 'Enter learning objectives.']
    ];

    for (const [name, message] of fields) {
      const field = document.querySelector(`[name="${name}"]`);
      if ((field?.type === 'file' && !field.files.length) || (!field?.value?.trim())) {
        errors.push(message);
      }
    }

    if (errors.length) {
      errors.forEach(showToast);
      return false;
    }
  }

  if (index === 1) {
    return validateTab1Fields(); // Will validate structure tab when moving from tab 1 to 2
  }

  return true;
}

// === Thumbnail Preview ===
function previewThumbnail(input) {
  const preview = document.getElementById('thumbnail-preview');
  preview.innerHTML = '';

  if (!input.files?.length) return;

  const reader = new FileReader();
  reader.onload = e => {
    const img = document.createElement('img');
    img.src = e.target.result;
    preview.appendChild(img);
  };
  reader.readAsDataURL(input.files[0]);
}

// === Toggle Expand/Collapse ===
function toggleSection(icon, type) {
  const block = icon.closest(`.${type}-block`);
  const content = block.querySelector(`.${type}-content`);
  if (!content) return;

  const collapsed = content.getAttribute('data-collapsed') === 'true';
  content.setAttribute('data-collapsed', collapsed ? 'false' : 'true');
  content.style.maxHeight = collapsed ? content.scrollHeight + 'px' : '0px';
  icon.innerHTML = collapsed ? '&#9662;' : '&#9656;';
}

// === Empty Check
function isContentEmpty(block) {
  const fields = block.querySelectorAll('input, textarea');
  return [...fields].every(f => !f.value.trim());
}

function generateTopicId() {
  return `topic_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}


// === Add Module
function addModule() {
  const container = document.getElementById('modules-container');
  const modNum = container.children.length + 1;

  const module = document.createElement('div');
  module.className = 'module-block';

  const header = document.createElement('h4');
  header.innerHTML = `<span class="toggle-icon" onclick="toggleSection(this, 'module')">&#9662;</span> 
                      <i class="fas fa-cube"></i> Module ${modNum}`;
  const del = document.createElement('button');
  del.className = 'delete-btn';
  del.innerHTML = `<i class="fas fa-trash-alt"></i>`;
  del.onclick = () => {
    if (container.children.length > 1) {
      if (isContentEmpty(module)) module.remove();
      else showToast("Clear fields before deleting this module.");
    } else showToast("At least one module is required.");
  };
  header.appendChild(del);
  module.appendChild(header);

  const content = document.createElement('div');
  content.className = 'module-content';
  content.setAttribute('data-collapsed', 'false');
  content.innerHTML = `
    <input type="text" placeholder="Module Title" required>
    <textarea placeholder="Module Description" required></textarea>
    <div class="chapters-container"></div>
    <button type="button" class="btn-outline" onclick="addChapter(this)">+ Add Chapter</button>`;
  module.appendChild(content);
  container.appendChild(module);
const topicContainer = addChapter(content.querySelector('.btn-outline'));
addTopic(topicContainer);  // ✅ no need to rename now


}

// === Add Chapter
function addChapter(btn) {
  const chapters = btn.previousElementSibling;
  const module = btn.closest('.module-block');
  const modNum = [...document.querySelectorAll('.module-block')].indexOf(module) + 1;
  const chapNum = chapters.children.length + 1;

  const chapter = document.createElement('div');
  chapter.className = 'chapter-block';

  const header = document.createElement('h5');
  header.innerHTML = `<span class="toggle-icon" onclick="toggleSection(this, 'chapter')">&#9662;</span>
                      <i class="fas fa-folder"></i> Chapter ${modNum}.${chapNum}`;
  const del = document.createElement('button');
  del.className = 'delete-btn';
  del.innerHTML = `<i class="fas fa-trash-alt"></i>`;
  del.onclick = () => {
    if (chapters.children.length > 1) {
      if (isContentEmpty(chapter)) chapter.remove();
      else showToast("Clear fields before deleting this chapter.");
    } else showToast("At least one chapter is required.");
  };
  header.appendChild(del);
  chapter.appendChild(header);

  const content = document.createElement('div');
  content.className = 'chapter-content';
  content.setAttribute('data-collapsed', 'false');
  content.innerHTML = `
    <input type="text" placeholder="Chapter Title" required>
    <textarea placeholder="Chapter Description" required></textarea>
    <div class="topics-container"></div>
    <button type="button" class="btn-outline" onclick="addTopic(this)">+ Add Topic</button>`;
  chapter.appendChild(content);
  chapters.appendChild(chapter);

  return content.querySelector('.topics-container');
}

// === Add Topic
function addTopic(btnOrContainer) {
  let container;

  if (btnOrContainer.classList.contains('btn-outline')) {
    container = btnOrContainer.previousElementSibling;
  } else {
    container = btnOrContainer;
  }

  const chapter = container.closest('.chapter-block');
  const chapterNum = chapter.querySelector('h5')?.textContent.match(/\d+\.\d+/)?.[0] || '?';
  const topicNum = container.children.length + 1;
  const topicId = generateTopicId();

  const topic = document.createElement('div');
  topic.className = 'topic-block';
  topic.setAttribute('data-topic-id', topicId);

  const header = document.createElement('h6');
  header.innerHTML = `<span class="toggle-icon" onclick="toggleSection(this, 'topic')">&#9662;</span> 
                      <i class="fas fa-file-alt"></i> Topic ${chapterNum}.${topicNum}`;
  
  const del = document.createElement('button');
  del.className = 'delete-btn';
  del.innerHTML = `<i class="fas fa-trash-alt"></i>`;
  del.onclick = () => {
    if (container.children.length > 1) {
      if (isContentEmpty(topic)) topic.remove();
      else showToast("Clear fields before deleting this topic.");
    } else showToast("At least one topic is required.");
  };
  header.appendChild(del);
  topic.appendChild(header);

  const content = document.createElement('div');
  content.className = 'topic-content';
  content.setAttribute('data-collapsed', 'false');
  content.innerHTML = `
    <input type="hidden" name="topic_ids[]" value="${topicId}">
    <input type="text" placeholder="Topic Title" required>
    <textarea placeholder="Topic Description" required></textarea>
    <select onchange="toggleUploadField(this, '${topicId}')">
      <option value="video">Video</option>
      <option value="pdf">PDF</option>
      <option value="zip">ZIP</option>
      <option value="image">Image</option>
      <option value="other">Other</option>
      <option value="link">Link</option>
    </select>
    <div class="upload-container" id="upload-container-${topicId}">
      <input type="file" name="topic_file_${topicId}" onchange="previewTopicFile(this, '${topicId}')" required>
      <div id="preview_${topicId}" class="file-preview"></div>
    </div>
    <input type="number" placeholder="Estimated Time (minutes)" required>`;
  
  topic.appendChild(content);
  container.appendChild(topic);
}

function previewTopicFile(input, topicId) {
  const previewDiv = document.getElementById(`preview_${topicId}`);

  if (input.files && input.files[0]) {
    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const fileType = file.type;

      if (fileType.startsWith('image/')) {
        previewDiv.innerHTML = `<img src="${e.target.result}" class="preview-img">`;
      } else if (fileType.startsWith('video/')) {
        previewDiv.innerHTML = `<video src="${e.target.result}" controls class="preview-video"></video>`;
      } else {
        previewDiv.innerHTML = `<p><i class="fas fa-file"></i> ${file.name}</p>`;
      }
    };

    reader.readAsDataURL(file);
  } else {
    previewDiv.innerHTML = '';
  }
}

function toggleUploadField(selectElem, topicId) {
  const uploadContainer = document.getElementById(`upload-container-${topicId}`);
  const fileInput = uploadContainer.querySelector('input[type="file"]');
  const selectedType = selectElem.value;

  if (selectedType === 'link') {
    uploadContainer.innerHTML = `<input type="url" name="topic_file_${topicId}" placeholder="External Link URL" required>`;
  } else {
    let acceptType = '';
    switch (selectedType) {
      case 'video':
        acceptType = 'video/*';
        break;
      case 'pdf':
        acceptType = 'application/pdf';
        break;
      case 'zip':
        acceptType = '.zip';
        break;
      case 'image':
        acceptType = 'image/*';
        break;
      default:
        acceptType = '*/*';
    }

    uploadContainer.innerHTML = `
      <input type="file" name="topic_file_${topicId}" accept="${acceptType}" onchange="previewTopicFile(this, '${topicId}')" required>
      <div id="preview_${topicId}" class="file-preview"></div>`;
  }
}

// === Expand All Before Validation
function expandAllBeforeValidation() {
  document.querySelectorAll('[data-collapsed="true"]').forEach(el => {
    el.setAttribute('data-collapsed', 'false');
    el.style.maxHeight = el.scrollHeight + 'px';
  });
}

// === Tab 1 Validation
function validateTab1Fields() {
  const modules = document.querySelectorAll('.module-block');
  let valid = true;

  if (!modules.length) {
    showToast("At least one module is required.");
    return false;
  }

  modules.forEach((module, mIndex) => {
    const modNum = mIndex + 1;
    const modTitle = module.querySelector('input');
    const modDesc = module.querySelector('textarea');
    if (!modTitle?.value.trim()) {
      showToast(`Module ${modNum}: Title is required.`);
      valid = false;
    }
    if (!modDesc?.value.trim()) {
      showToast(`Module ${modNum}: Description is required.`);
      valid = false;
    }

    const chapters = module.querySelectorAll('.chapter-block');
    if (!chapters.length) {
      showToast(`Module ${modNum}: At least one chapter is required.`);
      valid = false;
    }

    chapters.forEach((chapter, cIndex) => {
      const chapNum = `${modNum}.${cIndex + 1}`;
      const chapTitle = chapter.querySelector('input');
      const chapDesc = chapter.querySelector('textarea');
      if (!chapTitle?.value.trim()) {
        showToast(`Chapter ${chapNum}: Title is required.`);
        valid = false;
      }
      if (!chapDesc?.value.trim()) {
        showToast(`Chapter ${chapNum}: Description is required.`);
        valid = false;
      }

      const topics = chapter.querySelectorAll('.topic-block');
      if (!topics.length) {
        showToast(`Chapter ${chapNum}: At least one topic is required.`);
        valid = false;
      }

      topics.forEach((topic, tIndex) => {
        const topicNum = `${chapNum}.${tIndex + 1}`;
        const title = topic.querySelector('input[placeholder="Topic Title"]');
        const desc = topic.querySelector('textarea[placeholder="Topic Description"]');
        const time = topic.querySelector('input[type="number"]');
        const contentInput = topic.querySelector('.upload-container input');

        if (!title?.value.trim()) {
          showToast(`Topic ${topicNum}: Title is required.`);
          valid = false;
        }
        if (!desc?.value.trim()) {
          showToast(`Topic ${topicNum}: Description is required.`);
          valid = false;
        }
        if (!time?.value || parseInt(time.value) <= 0) {
          showToast(`Topic ${topicNum}: Valid time is required.`);
          valid = false;
        }
        if (!contentInput) {
          showToast(`Topic ${topicNum}: Content is required.`);
          valid = false;
        } else {
          const isFile = contentInput.type === 'file';
          const isText = contentInput.type === 'text';

          if ((isFile && contentInput.files.length === 0) ||
              (isText && !contentInput.value.trim())) {
            showToast(`Topic ${topicNum}: Please provide ${isFile ? 'a file' : 'a link'}.`);
            valid = false;
          }
        }
      });
    });
  });

  return valid;
}


// === On Load: Add default module/chapter/topic
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('modules-container');
  const draft = localStorage.getItem('courseDraft');

  if (draft) {
    const data = JSON.parse(draft);
    document.querySelector('[name="course_title"]').value = data.title || '';
    document.querySelector('[name="description"]').value = data.description || '';
    document.querySelector('[name="difficulty"]').value = data.difficulty || '';
    document.querySelector('[name="category"]').value = data.category || '';
    document.querySelector('[name="language"]').value = data.language || '';
    document.querySelector('[name="prerequisites"]').value = data.prerequisites || '';
    document.querySelector('[name="learning_objectives"]').value = data.learning_objectives || '';

    // Clear existing modules (just in case)
    container.innerHTML = '';

    // Rebuild structure
    data.structure.forEach(mod => {
      addModule();
      const modBlock = [...document.querySelectorAll('.module-block')].pop();
      modBlock.querySelector('input').value = mod.title;
      modBlock.querySelector('textarea').value = mod.description;

      const chapterContainer = modBlock.querySelector('.chapters-container');
      chapterContainer.innerHTML = '';

      mod.chapters.forEach(chap => {
        const chapContainer = addChapter(modBlock.querySelector('.btn-outline'));
        const chapBlock = [...chapterContainer.querySelectorAll('.chapter-block')].pop();
        chapBlock.querySelector('input').value = chap.title;
        chapBlock.querySelector('textarea').value = chap.description;

        const topicContainer = chapBlock.querySelector('.topics-container');
        topicContainer.innerHTML = '';

        chap.topics.forEach(topic => {
          addTopic(topicContainer);
          const topicBlock = [...topicContainer.querySelectorAll('.topic-block')].pop();
          topicBlock.querySelector('input[type="text"]').value = topic.title;
          topicBlock.querySelector('textarea').value = topic.description;
          topicBlock.querySelector('select').value = topic.content_type;
          toggleUploadField(topicBlock.querySelector('select'));
          topicBlock.querySelector('.upload-container input').value = topic.content;
          topicBlock.querySelector('input[type="number"]').value = topic.time;
        });
      });
    });

    showToast("Draft loaded from local storage.");
  } else {
    // No draft, add default structure
    if (!document.querySelector('.module-block')) {
      addModule();  // ✅ will add chapter + topic too
    }
  }
});

function populateContentTab() {
  const container = document.getElementById('content-container');
  container.innerHTML = '';

  const modules = document.querySelectorAll('.module-block');
  if (!modules.length) {
    container.innerHTML = `<div class="empty-content-note"><i class="fas fa-info-circle"></i> No modules found. Please add structure first.</div>`;
    return;
  }

  modules.forEach((module, mIndex) => {
    const modTitle = module.querySelector('input')?.value.trim() || `Untitled Module`;
    const modNum = mIndex + 1;

    const moduleBlock = document.createElement('div');
    moduleBlock.className = 'content-module';
    moduleBlock.innerHTML = `<h4><i class="fas fa-cube"></i> Module ${modNum}: ${modTitle}</h4>`;

    const chapters = module.querySelectorAll('.chapter-block');
    if (!chapters.length) {
      moduleBlock.innerHTML += `<p class="empty-content-note">No chapters found in this module.</p>`;
    }

    chapters.forEach((chapter, cIndex) => {
      const chapTitle = chapter.querySelector('input')?.value.trim() || `Untitled Chapter`;
      const chapNum = cIndex + 1;
      const chapterNumber = `${modNum}.${chapNum}`;

      const chapterBlock = document.createElement('div');
      chapterBlock.className = 'content-chapter';
      chapterBlock.innerHTML = `<h5><i class="fas fa-folder-open"></i> Chapter ${chapterNumber}: ${chapTitle}</h5>`;

      const topics = chapter.querySelectorAll('.topic-block');
      if (!topics.length) {
        chapterBlock.innerHTML += `<p class="empty-content-note">No topics in this chapter.</p>`;
      }

      topics.forEach((topic, tIndex) => {
        const topicTitle = topic.querySelector('input[type="text"]')?.value.trim() || `Untitled Topic`;
        const topicTime = topic.querySelector('input[type="number"]')?.value || '--';
        const contentType = topic.querySelector('select')?.value || 'other';
        const iconClass = getContentTypeIcon(contentType);
        const topicNum = `${chapterNumber}.${tIndex + 1}`;

        let previewURL = '';
        if (contentType === 'link') {
          const linkInput = topic.querySelector('.upload-container input[type="text"]');
          previewURL = linkInput?.value.trim() || '';
        } else {
          const fileInput = topic.querySelector('.upload-container input[type="file"]');
          const file = fileInput?.files?.[0];
          if (file) {
            try {
              previewURL = URL.createObjectURL(file);
            } catch (e) {
              console.error("Could not generate preview URL:", e);
            }
          }
        }

        const safePreviewURL = previewURL?.replace(/"/g, '&quot;') || '';

        const topicBlock = document.createElement('div');
        topicBlock.className = 'content-topic animated-fadein';

        topicBlock.innerHTML = `
          <div class="topic-header">
            <i class="${iconClass}"></i>
            <span class="topic-title">Topic ${topicNum}: ${topicTitle}</span>
            <span class="topic-time"><i class="fas fa-clock"></i> ${topicTime} min</span>
            <span class="topic-type">(${contentType})</span>
          </div>
          <div class="topic-upload">
            <button type="button" class="btn-preview" onclick="openContentPreview('${safePreviewURL}', '${contentType}')">
              <i class="fas fa-eye"></i> Preview
            </button>
          </div>
        `;

        chapterBlock.appendChild(topicBlock);
      });

      moduleBlock.appendChild(chapterBlock);
    });

    container.appendChild(moduleBlock);
  });
}


function getContentTypeIcon(type) {
  const icons = {
    video: 'fas fa-video',
    pdf: 'fas fa-file-pdf',
    zip: 'fas fa-file-archive',
    image: 'fas fa-image',
    link: 'fas fa-link',
    other: 'fas fa-file'
  };
  return icons[type] || 'fas fa-file-alt';
}

function openContentPreview(url, type) {
  if (!url || url === 'undefined') {
    alert('No preview available.');
    return;
  }

  // Preview in new tab
  window.open(url, '_blank');
}


function populateFinalPreview() {
  // === Course Details Preview ===
  document.getElementById('preview-title').textContent = document.querySelector('[name="course_title"]')?.value || '-';
  document.getElementById('preview-category').textContent = document.querySelector('[name="category"]')?.value || '-';
  document.getElementById('preview-level').textContent = document.querySelector('[name="difficulty"]')?.value || '-';
  document.getElementById('preview-language').textContent = document.querySelector('[name="language"]')?.value || '-';
  document.getElementById('preview-description').textContent = document.querySelector('[name="description"]')?.value || '-';
  document.getElementById('preview-prerequisites').textContent = document.querySelector('[name="prerequisites"]')?.value || '-';
  document.getElementById('preview-objectives').textContent = document.querySelector('[name="learning_objectives"]')?.value || '-';

  // === Structure Preview ===
  const container = document.getElementById('preview-structure');
  container.innerHTML = '';

  const modules = document.querySelectorAll('.module-block');
  if (!modules.length) {
    container.innerHTML = `<div class="empty-content-note"><i class="fas fa-info-circle"></i> No modules found.</div>`;
    return;
  }

  modules.forEach((module, mIndex) => {
    const modTitle = module.querySelector('input')?.value || `Untitled Module`;
    const modDesc = module.querySelector('textarea')?.value || '';
    const moduleDiv = document.createElement('div');
    moduleDiv.classList.add('preview-module');
    moduleDiv.innerHTML = `
      <h5><i class="fas fa-box"></i> Module ${mIndex + 1}: ${modTitle}</h5>
      <p class="muted-desc">${modDesc}</p>
    `;

    const chapters = module.querySelectorAll('.chapter-block');
    chapters.forEach((chapter, cIndex) => {
      const chapTitle = chapter.querySelector('input')?.value || `Untitled Chapter`;
      const chapDesc = chapter.querySelector('textarea')?.value || '';
      const chapterDiv = document.createElement('div');
      chapterDiv.classList.add('preview-chapter');
      chapterDiv.innerHTML = `
        <h6><i class="fas fa-book"></i> Chapter ${mIndex + 1}.${cIndex + 1}: ${chapTitle}</h6>
        <p class="muted-desc">${chapDesc}</p>
      `;

      const topics = chapter.querySelectorAll('.topic-block');
      topics.forEach((topic, tIndex) => {
        const topicTitle = topic.querySelector('input[type="text"]')?.value || `Untitled Topic`;
        const topicDesc = topic.querySelector('textarea')?.value || '';
        const topicTime = topic.querySelector('input[type="number"]')?.value || '--';
        const contentType = topic.querySelector('select')?.value || '-';
        const contentInput = topic.querySelector('.upload-container input');
        const topicNum = `${mIndex + 1}.${cIndex + 1}.${tIndex + 1}`;

        let previewContent = '';
        if (contentType === 'link') {
          const link = contentInput?.value?.trim();
          previewContent = link ? `<a href="${link}" target="_blank">${link}</a>` : 'No link provided';
        } else if (contentInput?.files?.length) {
          const file = contentInput.files[0];
          previewContent = `<span><i class="fas fa-file-alt"></i> ${file.name}</span>`;
        } else {
          previewContent = `<span>No content uploaded</span>`;
        }

        const topicDiv = document.createElement('div');
        topicDiv.classList.add('preview-topic');
        topicDiv.innerHTML = `
          <p><strong>Topic ${topicNum}:</strong> ${topicTitle}</p>
          <p><em>${topicDesc}</em></p>
          <p><i class="fas fa-clock"></i> ${topicTime} min | <i class="fas fa-file"></i> ${contentType}</p>
          <p>${previewContent}</p>
        `;
        chapterDiv.appendChild(topicDiv);
      });

      moduleDiv.appendChild(chapterDiv);
    });

    container.appendChild(moduleDiv);
  });
}


//tab4
function saveDraft() {
  // Validate core tabs
  if (!validateTab(0) || !validateTab1Fields()) {
    showToast("Please fix all errors before saving draft.");
    return;
  }

  // Generate structure JSON (minimal version here; you can expand it)
  const structure = [];
  const modules = document.querySelectorAll('.module-block');

  modules.forEach((mod, modIndex) => {
    const moduleTitle = mod.querySelector('input')?.value || `Module ${modIndex + 1}`;
    const moduleDesc = mod.querySelector('textarea')?.value || '';

    const chapters = [];
    mod.querySelectorAll('.chapter-block').forEach((chap, chapIndex) => {
      const chapterTitle = chap.querySelector('input')?.value || `Chapter ${chapIndex + 1}`;
      const chapterDesc = chap.querySelector('textarea')?.value || '';

      const topics = [];
      chap.querySelectorAll('.topic-block').forEach((topic, topicIndex) => {
        const topicTitle = topic.querySelector('input[type="text"]')?.value || `Topic ${topicIndex + 1}`;
        const topicDesc = topic.querySelector('textarea')?.value || '';
        const contentType = topic.querySelector('select')?.value;
        const contentInput = topic.querySelector('.upload-container input');
        let contentValue = '';

        if (contentType === 'link') {
          contentValue = contentInput?.value.trim();
        } else if (contentInput?.files?.length) {
          contentValue = contentInput.files[0]?.name || '';
        }

        const time = topic.querySelector('input[type="number"]')?.value || '';

        topics.push({
          title: topicTitle,
          description: topicDesc,
          content_type: contentType,
          content: contentValue,
          time
        });
      });

      chapters.push({
        title: chapterTitle,
        description: chapterDesc,
        topics
      });
    });

    structure.push({
      title: moduleTitle,
      description: moduleDesc,
      chapters
    });
  });

  document.getElementById('structure_json').value = JSON.stringify(structure);

  // Save to localStorage as a draft
  const draftData = {
    title: document.querySelector('[name="course_title"]').value,
    description: document.querySelector('[name="description"]').value,
    difficulty: document.querySelector('[name="difficulty"]').value,
    category: document.querySelector('[name="category"]').value,
    language: document.querySelector('[name="language"]').value,
    prerequisites: document.querySelector('[name="prerequisites"]').value,
    learning_objectives: document.querySelector('[name="learning_objectives"]').value,
    structure
  };

  localStorage.setItem('courseDraft', JSON.stringify(draftData));
  showToast("Course draft saved locally.");
}


function validateForm() {
  console.log("Running validateForm...");

  const isValidTab0 = validateTab(0);
  const isValidTab1 = validateTab1Fields();

  if (!isValidTab0 || !isValidTab1) {
    showToast("Fix all errors before submitting the course.");
    console.log("Validation failed. Submission blocked.");
    return false;
  }

  
  const structureObj = generateStructureJSON();
  console.log("Structure JSON Generated:", structureObj);


  console.log("Form validated successfully. Submitting...");
  return true;
}

function generateStructureJSON() {
  const structure = [];
  const modules = document.querySelectorAll('.module-block');

  modules.forEach((mod, modIndex) => {
    const moduleTitle = mod.querySelector('input')?.value?.trim() || `Module ${modIndex + 1}`;
    const moduleDesc = mod.querySelector('textarea')?.value?.trim() || '';

    const chapters = [];
    mod.querySelectorAll('.chapter-block').forEach((chap, chapIndex) => {
      const chapterTitle = chap.querySelector('input')?.value?.trim() || `Chapter ${chapIndex + 1}`;
      const chapterDesc = chap.querySelector('textarea')?.value?.trim() || '';

      const topics = [];
      chap.querySelectorAll('.topic-block').forEach((topic, topicIndex) => {
        const topicId = topic.getAttribute('data-topic-id');
        const topicTitle = topic.querySelector('input[type="text"]')?.value?.trim() || `Topic ${topicIndex + 1}`;
        const topicDesc = topic.querySelector('textarea')?.value?.trim() || '';
        const contentType = topic.querySelector('select')?.value;
        const contentInput = topic.querySelector('.upload-container input');
        const estimatedTime = topic.querySelector('input[type="number"]')?.value?.trim() || '';

        let contentValue = '';
        if (contentType === 'link') {
          contentValue = contentInput?.value?.trim();
        } else if (contentInput?.files?.length) {
          contentValue = contentInput.files[0]?.name || '';
        }

        topics.push({
          topic_id: topicId,
          title: topicTitle,
          description: topicDesc,
          content_type: contentType,
          content: contentValue,
          estimated_time: estimatedTime
        });
      });

      chapters.push({
        title: chapterTitle,
        description: chapterDesc,
        topics
      });
    });

    structure.push({
      title: moduleTitle,
      description: moduleDesc,
      chapters
    });
  });

  document.getElementById('structure_json').value = JSON.stringify({ modules: structure });
  return { modules: structure };
}
