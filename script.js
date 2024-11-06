import { sampleData } from './sampleData.js';
import { openDatabase, saveImage, loadImage, deleteImage } from './indexedDB.js';

document.addEventListener('DOMContentLoaded', async () => {
    const linksDiv = document.getElementById('links');
    const linkForm = document.getElementById('linkForm');
    const groupName = document.getElementById('groupName');
    const linkName = document.getElementById('linkName');
    const linkURL = document.getElementById('linkURL');
    const loadSampleButton = document.getElementById('loadSample');
    const openPopupButton = document.getElementById('openPopup');
    const closePopupButton = document.getElementById('closePopup');
    const popup = document.getElementById('popup');
    const submitBtn = document.getElementById('submitBtn');
    const overlay = document.getElementById('overlay');
    const confirmationDialog = document.getElementById('confirmationDialog');
    const confirmDeleteButton = document.getElementById('confirmDelete');
    const cancelDeleteButton = document.getElementById('cancelDelete');
    const imageImportButton = document.getElementById('imageImport');
    const resetBackgroundButton = document.getElementById('resetBackground');
    const fileInput = document.getElementById('fileInput');
    let editMode = false;
    let editGroup = '';
    let editIndex = -1;
    let openGroup = '';
    let groupToDelete = '';
    let db;

    // Open IndexedDB
    try {
        db = await openDatabase();
    } catch (error) {
        console.error('Failed to open IndexedDB:', error);
    }

    // Load links from localStorage
    const loadLinks = () => {
        const groups = JSON.parse(localStorage.getItem('favoriteLinks')) || {};
        linksDiv.innerHTML = '';
        for (const group in groups) {
            if (Array.isArray(groups[group])) {
                const groupElement = document.createElement('div');
                groupElement.className = 'accordion-item';
                groupElement.innerHTML = `
                    <div class="accordion-header">
                        ${group}
                        <i class="fas fa-trash-alt delete-group" data-group="${group}"></i>
                    </div>
                    <div class="accordion-content"></div>
                `;
                const contentDiv = groupElement.querySelector('.accordion-content');
                groups[group].forEach((link, index) => {
                    const linkElement = document.createElement('div');
                    linkElement.className = 'link';
                    linkElement.innerHTML = `
                        <a href="${link.url}" target="_blank">${link.name}</a>
                        <div class="link-buttons">
                            <button class="edit-button" data-group="${group}" data-index="${index}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-button" data-group="${group}" data-index="${index}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    `;
                    contentDiv.appendChild(linkElement);
                });
                linksDiv.appendChild(groupElement);
                
                // Keep the accordion open if it was open before
                if (group === openGroup) {
                    contentDiv.classList.add('open');
                    contentDiv.style.display = 'block';
                }
            }
        }

        // Add accordion functionality
        const headers = document.querySelectorAll('.accordion-header');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                content.classList.toggle('open');
                content.style.display = content.classList.contains('open') ? 'block' : 'none';
                openGroup = content.classList.contains('open') ? header.textContent : '';
            });
        });

        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const group = e.target.closest('button').dataset.group;
                const index = e.target.closest('button').dataset.index;
                editLink(group, index);
            });
        });

        document.querySelectorAll('.delete-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const group = e.target.closest('button').dataset.group;
                const index = e.target.closest('button').dataset.index;
                deleteLink(group, index);
            });
        });

        // Add event listeners for delete group icons
        document.querySelectorAll('.delete-group').forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent accordion toggle
                groupToDelete = e.target.dataset.group;
                overlay.style.display = 'block';
                confirmationDialog.style.display = 'block';
            });
        });
    };

    // Save a new link to localStorage
    const saveLink = (group, name, url) => {
        const groups = JSON.parse(localStorage.getItem('favoriteLinks')) || {};
        if (!Array.isArray(groups[group])) {
            groups[group] = [];
        }
        if (editMode) {
            groups[editGroup][editIndex] = { name, url };
            editMode = false;
            editGroup = '';
            editIndex = -1;
        } else {
            groups[group].push({ name, url });
        }
        localStorage.setItem('favoriteLinks', JSON.stringify(groups));
        loadLinks();
    };

    // Handle form submission
    linkForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveLink(groupName.value, linkName.value, linkURL.value);
        groupName.value = '';
        linkName.value = '';
        linkURL.value = '';
        popup.style.display = 'none';
        submitBtn.value = 'Add Link'; // Reset button text

        // Keep the accordion open after save
        openGroup = groupName.value;
    });

    // Load sample data on button click
    loadSampleButton.addEventListener('click', () => {
        localStorage.setItem('favoriteLinks', JSON.stringify(sampleData));
        loadLinks();
    });

    // Open popup
    openPopupButton.addEventListener('click', () => {
        popup.style.display = 'flex';
        submitBtn.value = 'Add Link'; // Set button text for adding
    });

    // Close popup
    closePopupButton.addEventListener('click', () => {
        popup.style.display = 'none';
        submitBtn.value = 'Add Link'; // Reset button text
    });

    // Close popup on Esc key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            popup.style.display = 'none';
            submitBtn.value = 'Add Link'; // Reset button text
        }
    });

    // Edit link
    const editLink = (group, index) => {
        const groups = JSON.parse(localStorage.getItem('favoriteLinks')) || {};
        const link = groups[group][index];
        groupName.value = group;
        linkName.value = link.name;
        linkURL.value = link.url;
        editMode = true;
        editGroup = group;
        editIndex = index;
        popup.style.display = 'flex';
        submitBtn.value = 'Save'; // Change button text to Save
    };

    // Delete link
    const deleteLink = (group, index) => {
        const groups = JSON.parse(localStorage.getItem('favoriteLinks')) || {};
        groups[group].splice(index, 1);
        localStorage.setItem('favoriteLinks', JSON.stringify(groups));
        openGroup = group; // Keep the accordion open after delete
        loadLinks();
    };

    // Confirm delete group
    confirmDeleteButton.addEventListener('click', () => {
        const groups = JSON.parse(localStorage.getItem('favoriteLinks')) || {};
        delete groups[groupToDelete];
        localStorage.setItem('favoriteLinks', JSON.stringify(groups));
        overlay.style.display = 'none';
        confirmationDialog.style.display = 'none';
        loadLinks();
    });

    // Cancel delete group
    cancelDeleteButton.addEventListener('click', () => {
        overlay.style.display = 'none';
        confirmationDialog.style.display = 'none';
    });

    // Handle image import
    imageImportButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const imageUrl = event.target.result;
                document.body.style.backgroundImage = `url(${imageUrl})`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
                try {
                    await saveImage(db, imageUrl); // Save image to IndexedDB
                } catch (error) {
                    console.error('Failed to save image to IndexedDB:', error);
                }
            };
            reader.readAsDataURL(file);
        }
    });

    // Handle reset background
    resetBackgroundButton.addEventListener('click', async () => {
        document.body.style.backgroundImage = '';
        try {
            await deleteImage(db); // Remove image from IndexedDB
        } catch (error) {
            console.error('Failed to delete image from IndexedDB:', error);
        }
    });

   // Load background image from IndexedDB
   const loadBackgroundImage = async () => {
    try {
        const savedBackgroundImage = await loadImage(db);
        if (savedBackgroundImage) {
            document.body.style.backgroundImage = `url(${savedBackgroundImage})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
        }
    } catch (error) {
        console.error('Failed to load image from IndexedDB:', error);
    }
};

    // Initial load
    loadLinks();
    loadBackgroundImage();
});