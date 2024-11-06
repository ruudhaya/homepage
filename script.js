document.addEventListener('DOMContentLoaded', () => {
    const linksDiv = document.getElementById('links');
    const linkForm = document.getElementById('linkForm');
    const groupName = document.getElementById('groupName');
    const linkName = document.getElementById('linkName');
    const linkURL = document.getElementById('linkURL');
    const loadSampleButton = document.getElementById('loadSample');

    // Sample data
    const sampleData = {
        "Work": [
            { name: "Google", url: "https://www.google.com" },
            { name: "GitHub", url: "https://www.github.com" }
        ],
        "Social": [
            { name: "Facebook", url: "https://www.facebook.com" },
            { name: "Twitter", url: "https://www.twitter.com" }
        ],
        "News": [
            { name: "CNN", url: "https://www.cnn.com" },
            { name: "BBC", url: "https://www.bbc.com" }
        ],
        "Entertainment": [
            { name: "YouTube", url: "https://www.youtube.com" },
            { name: "Netflix", url: "https://www.netflix.com" }
        ]
    };

    // Load links from localStorage
    const loadLinks = () => {
        const groups = JSON.parse(localStorage.getItem('favoriteLinks')) || {};
        linksDiv.innerHTML = '';
        for (const group in groups) {
            if (Array.isArray(groups[group])) {
                const groupElement = document.createElement('div');
                groupElement.className = 'accordion-item';
                groupElement.innerHTML = `
                    <div class="accordion-header">${group}</div>
                    <div class="accordion-content"></div>
                `;
                const contentDiv = groupElement.querySelector('.accordion-content');
                groups[group].forEach(link => {
                    const linkElement = document.createElement('div');
                    linkElement.className = 'link';
                    linkElement.innerHTML = `<a href="${link.url}" target="_blank">${link.name}</a>`;
                    contentDiv.appendChild(linkElement);
                });
                linksDiv.appendChild(groupElement);
            }
        }

        // Add accordion functionality
        const headers = document.querySelectorAll('.accordion-header');
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                content.style.display = content.style.display === 'block' ? 'none' : 'block';
            });
        });
    };

    // Save a new link to localStorage
    const saveLink = (group, name, url) => {
        const groups = JSON.parse(localStorage.getItem('favoriteLinks')) || {};
        if (!Array.isArray(groups[group])) {
            groups[group] = [];
        }
        groups[group].push({ name, url });
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
    });

    // Load sample data on button click
    loadSampleButton.addEventListener('click', () => {
        localStorage.setItem('favoriteLinks', JSON.stringify(sampleData));
        loadLinks();
    });

    // Initial load
    loadLinks();
});