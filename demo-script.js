// --- Data (Simulating a more complex data structure) ---
let topicData = { // Make topicData let so it can be updated
    "Artificial Intelligence": { suggested: ["Machine Learning", "Data Analytics", "Robotics", "Deep Learning", "Natural Language Processing"] },
    "Machine Learning": { suggested: ["Artificial Intelligence", "Data Analytics", "Deep Learning", "Reinforcement Learning", "Supervised Learning"] },
    "Cybersecurity": { suggested: ["Network Security", "Data Privacy", "Ethical Hacking", "Cryptography", "Malware Analysis"] },
    "Data Analytics": { suggested: ["Machine Learning", "Artificial Intelligence", "Data Visualization", "Big Data", "Statistical Modeling"] },
    "Cloud Computing": { suggested: ["AWS", "Azure", "Google Cloud", "Serverless", "Containerization"] },
    "Blockchain": { suggested: ["Cryptography", "Distributed Systems", "Smart Contracts", "Cryptocurrency", "Decentralized Applications"] },
    "Internet of Things (IoT)": { suggested: ["Embedded Systems", "Sensors", "Networking", "Cloud Computing", "Data Analytics"] },
    "Augmented Reality (AR)": { suggested: ["Computer Vision", "Mobile Development", "3D Modeling", "User Interface Design", "Game Development"] },
    "Virtual Reality (VR)": { suggested: ["Computer Vision", "3D Modeling", "Game Development", "User Interface Design", "Immersive Experiences"] },
    "Robotics": { suggested: ["Artificial Intelligence", "Machine Learning", "Embedded Systems", "Control Systems", "Computer Vision"] },
    // Add more topics and suggestions here
};

// Initial available topics (can be a subset of all topics)
let availableTopics = Object.keys(topicData);
let suggestedTopics = [];
let selectedTopics = [];

// --- DOM Elements ---
const availableTopicsContainer = document.getElementById('available-topics');
const selectedTopicsContainer = document.getElementById('selected-topics');
const viewReportButton = document.getElementById('view-report-button');
const thinkingOverlay = document.getElementById('thinking-overlay'); // Get the overlay
const personalizeTopicsButton = document.getElementById('personalize-topics-button'); // New button
const companyNameInput = document.getElementById('companyName'); // Company name input
const divisionInput = document.getElementById('division'); // Division input


// --- Functions ---

// Placeholder function for LLM call
async function fetchLLMTopicData(companyName, division) {
    console.log("Calling LLM with Company:", companyName, "Division:", division);
    showThinkingOverlay(); // Show thinking overlay while "fetching"

    // Simulate LLM processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // --- Placeholder for LLM logic ---
    // In a real implementation, this function would:
    // 1. Send companyName and division to an LLM API.
    // 2. Receive a response from the LLM, likely containing:
    //    - A new set of topicData tailored for the company/division.
    //    - Or, suggestions to modify the existing topicData or availableTopics.

    // --- Example of a placeholder response (for demonstration) ---
    // Here, we just log the inputs and return the original topicData.
    // In a real scenario, you would process the LLM response here.

    hideThinkingOverlay(); // Hide thinking overlay after "fetching"

    // Return the (potentially modified) topicData
    return topicData; // For now, return original, in real case, process LLM response to modify and return
}


function showThinkingOverlay() {
    thinkingOverlay.classList.add('active');
}

function hideThinkingOverlay() {
    thinkingOverlay.classList.remove('active');
}

function renderTopics() {
    availableTopicsContainer.innerHTML = '';
    selectedTopicsContainer.innerHTML = '';

    // Combine available and suggested topics, removing duplicates and selected topics.
    const allAvailable = [...new Set([...availableTopics, ...suggestedTopics])].filter(topic => !selectedTopics.includes(topic));

    allAvailable.forEach(topic => {
        const tag = document.createElement('div');
        tag.textContent = topic;
        let tagClass = 'tag';
        if (suggestedTopics.includes(topic)) {
            tagClass += ' suggested'; // Add 'suggested' class
        }
        tag.className = tagClass;
        tag.setAttribute('draggable', true);
        tag.setAttribute('data-topic', topic);
        availableTopicsContainer.appendChild(tag);
    });

    selectedTopics.forEach(topic => {
      const tag = document.createElement('div');
      tag.textContent = topic;
      tag.className = 'tag selected';
      tag.setAttribute('draggable', true);
      tag.setAttribute('data-topic', topic);
      selectedTopicsContainer.appendChild(tag);
    });
}

function updateViewReportButton() {
  const hasSelectedTopics = selectedTopics.length > 0;
  viewReportButton.disabled = !hasSelectedTopics;
  viewReportButton.setAttribute('aria-disabled', !hasSelectedTopics);
}

function updateAvailableTopics() {
    // 1.  Get suggestions based on selectedTopics.
    suggestedTopics = []; // Reset suggestions
    selectedTopics.forEach(topic => {
        if (topicData[topic] && topicData[topic].suggested) {
            suggestedTopics.push(...topicData[topic].suggested);
        }
    });
        // 2. Filter to remove duplicates and already selected topics
    suggestedTopics = [...new Set(suggestedTopics)].filter(topic => !selectedTopics.includes(topic));

        //3. Simulate the basic available topics
    availableTopics = Object.keys(topicData).filter(topic => !selectedTopics.includes(topic) && !suggestedTopics.includes(topic) );
}


// --- Drag and Drop with SortableJS ---
function initDragAndDrop() {
    new Sortable(availableTopicsContainer, {
        group: {
            name: 'shared',
            pull: 'clone',
            put: false, // Prevent dropping into available topics
        },
        animation: 150,
        sort: false, // Disable sorting within the available topics container
        onClone: function (evt) {
            // Optional:  Could add a visual cue here if needed.
        },
		onAdd: function (evt) {
			const topic = evt.item.dataset.topic;

				if (!selectedTopics.includes(topic)) {
					selectedTopics.push(topic);
					showThinkingOverlay(); // Show the overlay
					// Simulate AI "thinking"
					setTimeout(() => {
					  updateAvailableTopics();
					  renderTopics();
					  updateViewReportButton();
					  hideThinkingOverlay(); // Hide the overlay
					}, 1000); // 1-second delay

				}else{
				  renderTopics(); //just re-render, to not duplicate tags.
				}

		}
    });

    new Sortable(selectedTopicsContainer, {
        group: 'shared',
        animation: 150,
		onAdd: function (evt) {
			const topic = evt.item.dataset.topic;

				if (!selectedTopics.includes(topic)) { //prevent duplicates
					selectedTopics.push(topic);
					showThinkingOverlay();
					setTimeout(() => {
						updateAvailableTopics();
						renderTopics();
						updateViewReportButton();
						hideThinkingOverlay();
					}, 1000);

				}else{
					renderTopics();
				}
		},
		onRemove: function(evt) {
			const topic = evt.item.dataset.topic;
			const index = selectedTopics.indexOf(topic);
			if (index > -1) {
				selectedTopics.splice(index, 1);
				showThinkingOverlay();
				setTimeout(() => {
					updateAvailableTopics();
					renderTopics();
					updateViewReportButton();
					hideThinkingOverlay();
				}, 1000);
			}
		}
    });
}

// --- Event listeners ---
viewReportButton.addEventListener('click', () => {
    viewReportButton.disabled = true;
    viewReportButton.textContent = 'Generating Report...'; // Provide feedback

    setTimeout(() => { // Simulate report generation
        alert("Generating report for: " + selectedTopics.join(', '));
        viewReportButton.disabled = false;
        viewReportButton.textContent = 'View Report';
    }, 2000);
});

personalizeTopicsButton.addEventListener('click', async () => {
    const companyName = companyNameInput.value;
    const division = divisionInput.value;
    await fetchLLMTopicData(companyName, division); // Call the placeholder LLM function
    // After LLM call, you might want to update topicData, availableTopics, and re-render topics.
    // For now, the placeholder LLM function just logs the company/division.
    // If you want to update topics based on LLM response, you would do it here.
    // For example:
    // const newTopicData = await fetchLLMTopicData(companyName, division);
    // topicData = newTopicData; // Update topicData
    // availableTopics = Object.keys(topicData); // Re-initialize available topics
    // renderTopics(); // Re-render the topics
});


// --- Initialization ---
renderTopics();
initDragAndDrop();
updateViewReportButton(); // Ensure button is in correct state initially

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
