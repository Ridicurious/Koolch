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

// --- LLM Configuration (Move API Key to a more secure location for production!) ---
const apiKey = "AIzaSyDwaqRxXYmX9rJj7XWPDhmBor21d26AcCI"; // Replace with your actual API key.  Consider environment variables or backend proxy for security.
const modelName = "gemini-2.0-flash-thinking-exp-01-21"; // Use the correct model name

const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 65536,
  responseMimeType: "text/plain",
};

const systemInstruction = `Your final output in json with topics and subtopics in the following format:
{"Virtual Reality (VR)": { "suggested": ["Computer Vision", "3D Modeling", "Game Development", "User Interface Design", "Immersive Experiences"] },
"Robotics": { "suggested": ["Artificial Intelligence", "Machine Learning", "Embedded Systems", "Control Systems", "Computer Vision"] }}`;


// --- Functions ---

// Placeholder function for LLM call
async function fetchLLMTopicData(companyName, division) {
    console.log("Calling LLM with Company:", companyName, "Division:", division);
    showThinkingOverlay(); // Show thinking overlay while "fetching"

    try {
        // --- Initialize Generative AI and Model using global object (from CDN) ---
        // **No dynamic import needed anymore after CDN inclusion**
        const genAI = new GoogleGenerativeAI(apiKey); // Use global GoogleGenerativeAI
        const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemInstruction,
        });

        const chatSession = model.startChat({
            generationConfig,
            history: [], // No history needed for this single turn interaction
        });

        const prompt = `As an employee of ${companyName || 'a company'} working in ${division || 'a division'}, what are the technological topics that might interest me? Please provide the response in JSON format as specified in the system instruction.`;

        const result = await chatSession.sendMessage(prompt);
        const llmResponseText = result.response.text();
        console.log("LLM Response Text:", llmResponseText);

        // --- Parse JSON response from LLM ---
        try {
            const newTopicDataFromLLM = JSON.parse(llmResponseText);
            console.log("Parsed Topic Data from LLM:", newTopicDataFromLLM);
            topicData = newTopicDataFromLLM; // Update global topicData with LLM response

        } catch (jsonError) {
            console.error("Error parsing JSON response from LLM:", jsonError);
            alert("Error processing AI response. Please check console for details.");
            topicData = {}; // Reset topicData in case of error, or handle differently
        }


    } catch (llmError) {
        console.error("Error calling LLM:", llmError);
        alert("Failed to get personalized topics from AI. Please check console for details.");
        topicData = {}; // Reset topicData in case of error, or handle differently
    } finally {
        hideThinkingOverlay(); // Hide thinking overlay after "fetching" (success or error)
    }

    return topicData; // Return the (potentially modified) topicData
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

    if (!topicData || Object.keys(topicData).length === 0) {
        availableTopicsContainer.textContent = "No topics available."; // Display message if no topics
        return; // Exit if no topic data
    }


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
    const newTopicData = await fetchLLMTopicData(companyName, division); // Call the LLM function
    if (newTopicData && Object.keys(newTopicData).length > 0) {
        topicData = newTopicData; // Update topicData with the fetched data
        availableTopics = Object.keys(topicData); // Re-initialize available topics from the new topicData
    } else {
        topicData = {}; // Or keep the old data, or handle as you see fit.
        availableTopics = []; // No topics available if LLM failed and returned empty data.
    }
    suggestedTopics = []; // Clear suggested topics as the topic source has changed
    selectedTopics = []; // Clear selected topics as the topic source has changed
    renderTopics(); // Re-render the topics
    updateViewReportButton(); // Update button state
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
