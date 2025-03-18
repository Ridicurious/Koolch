// --- Data (replace with your actual topics) ---
const availableTopics = [
    "Artificial Intelligence",
    "Machine Learning",
    "Cybersecurity",
    "Data Analytics",
    "Cloud Computing",
    "Blockchain",
    "Internet of Things (IoT)",
    "Augmented Reality (AR)",
    "Virtual Reality (VR)",
    "Robotics"
];

const topicSuggestions = {
    "Artificial Intelligence": ["Machine Learning", "Data Analytics", "Robotics"],
    "Machine Learning": ["Artificial Intelligence", "Data Analytics", "Deep Learning"],
    "Cybersecurity": ["Network Security", "Data Privacy", "Ethical Hacking"],
    // Add more suggestions
};

// --- DOM Elements ---
const availableTopicsList = document.getElementById('available-topics');
const selectedTopicsList = document.getElementById('selected-topics');
const suggestedTopicsList = document.getElementById('suggested-topics');
const viewReportButton = document.getElementById('view-report-button');

// --- State ---
let selectedTopics = [];

// --- Functions ---

function renderTopics() {
    availableTopicsList.innerHTML = ''; // Clear existing lists
    selectedTopicsList.innerHTML = '';
    suggestedTopicsList.innerHTML = '';

    availableTopics.forEach(topic => {
        const listItem = document.createElement('li');
        listItem.textContent = topic;
        listItem.classList.add('available-topic'); // Add class for styling
        listItem.addEventListener('click', () => selectTopic(topic));
        availableTopicsList.appendChild(listItem);
    });

    selectedTopics.forEach(topic => {
        const listItem = document.createElement('li');
        listItem.textContent = topic;
        listItem.classList.add('selected-topic'); // Add class for styling

        const removeButton = document.createElement('span');
        removeButton.textContent = 'x';
        removeButton.classList.add('remove-button');
        removeButton.addEventListener('click', (event) => {
             event.stopPropagation(); //  Prevent the li click handler from firing
            removeTopic(topic);
        });
        listItem.appendChild(removeButton);

        selectedTopicsList.appendChild(listItem);
    });
    renderSuggestedTopics();

}
function renderSuggestedTopics() {
  suggestedTopicsList.innerHTML = ''; // Clear previous suggestions
  const suggestions = new Set(); // Use a Set to avoid duplicates

  selectedTopics.forEach(selectedTopic => {
    if (topicSuggestions[selectedTopic]) {
      topicSuggestions[selectedTopic].forEach(suggestion => {
        if (!selectedTopics.includes(suggestion) && availableTopics.includes(suggestion)) {
          suggestions.add(suggestion);
        }
      });
    }
  });

  suggestions.forEach(suggestion => {
    const listItem = document.createElement('li');
    listItem.textContent = suggestion;
    listItem.classList.add('suggested-topic'); // Add class for styling
    listItem.addEventListener('click', () => selectTopic(suggestion));
    suggestedTopicsList.appendChild(listItem);
  });
}

function selectTopic(topic) {
    if (!selectedTopics.includes(topic)) {
        selectedTopics.push(topic);
        //  Remove from availableTopics (optional, but cleaner)
        const index = availableTopics.indexOf(topic);
        if (index > -1) {
            availableTopics.splice(index, 1);
        }

        renderTopics(); // Re-render both lists
        updateViewReportButton();
    }
}

function removeTopic(topic) {
    const index = selectedTopics.indexOf(topic);
    if (index > -1) {
        selectedTopics.splice(index, 1);
        availableTopics.push(topic); // Add back to available topics
        renderTopics();
        updateViewReportButton();
    }
}

function updateViewReportButton() {
    viewReportButton.disabled = selectedTopics.length === 0;
}

// --- Event Listeners ---

viewReportButton.addEventListener('click', () => {
    //  Handle what happens when the button is clicked (e.g., generate report, show modal, etc.)
    alert("Generating report for: " + selectedTopics.join(', '));
});

// --- Initial Render ---
renderTopics();
// --- Component Loading ---
function loadComponent(url, containerId) {
    return fetch(url)
        .then(response => response.text())
        .then(html => {
            document.getElementById(containerId).innerHTML = html;
        })
        .catch(error => console.error('Error loading component:', error));
}

// --- Initialization ---
Promise.all([
	loadComponent('components/header.html', 'header-container'),
	loadComponent('components/footer.html', 'footer-container')
])
.then(() => {
	//  Finally, start the animation.
	initAnimation();
	window.addEventListener('resize', resizeCanvas); // Add resize listener here
})
.catch(error => console.error("Error during initialization:", error));
