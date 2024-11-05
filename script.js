document.addEventListener('DOMContentLoaded', () => {
    const linksDiv = document.getElementById('links');
    const linkForm = document.getElementById('linkForm');
    const linkName = document.getElementById('linkName');
    const linkURL = document.getElementById('linkURL');

    // Load links from localStorage
    const loadLinks = () => {
        const links = JSON.parse(localStorage.getItem('favoriteLinks')) || [];
        linksDiv.innerHTML = '';
        links.forEach(link => {
            const linkElement = document.createElement('div');
            linkElement.className = 'link';
            linkElement.innerHTML = `<a href="${link.url}" target="_blank">${link.name}</a>`;
            linksDiv.appendChild(linkElement);
        });
    };

    // Save a new link to localStorage
    const saveLink = (name, url) => {
        const links = JSON.parse(localStorage.getItem('favoriteLinks')) || [];
        links.push({ name, url });
        localStorage.setItem('favoriteLinks', JSON.stringify(links));
        loadLinks();
    };

    // Handle form submission
    linkForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveLink(linkName.value, linkURL.value);
        linkName.value = '';
        linkURL.value = '';
    });

    // Initial load
    loadLinks();
});