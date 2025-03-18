// --- Component Loading ---
function loadComponent(url, containerId) {
    return fetch(url)
        .then(response => response.text())
        .then(html => {
            document.getElementById(containerId).innerHTML = html;
        })
        .catch(error => console.error('Error loading component:', error));
}

// --- Dynamic Insight Loading ---
function loadInsight(insightId) {
    fetch(`insights/${insightId}.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Load the template *first* to ensure the canvas exists.
            return fetch('insights/template.html')
                .then(response => response.text())
                .then(templateHtml => {
                    // Replace *only* the main content, NOT the entire document.
                    document.getElementById('main-content').innerHTML = templateHtml;
                    document.getElementById('report-content').innerHTML = data.report_content;

                    // Load header and footer *within* the main-content
                    return Promise.all([
                        loadComponent('components/header.html', 'header-container'),
                        loadComponent('components/footer.html', 'footer-container')
                    ]);
                });
        })
        .then(() => {
             // *After* header/footer are loaded, re-initialize the animation.
            initAnimation();
        })
        .catch(error => {
            console.error('Error fetching or rendering insight:', error);
            document.getElementById('main-content').innerHTML = '<p>Insight not found.</p>';
        });
}


function loadInsightList() {
    return fetch('insights/list.json')
      .then(response => response.json())
      .then(insights => {
        const listElement = document.getElementById('insight-links');
        insights.forEach(insight => {
          const listItem = document.createElement('li');
          const link = document.createElement('a');
          link.href = '#'; // Use '#' to prevent default navigation
          link.textContent = insight.title;
          link.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent the '#' from jumping to the top
            loadInsight(insight.id);
          });
          listItem.appendChild(link);
          listElement.appendChild(listItem);
        });
      })
      .catch(error => console.error('Error fetching insight list:', error));
}

// --- Canvas Animation Initialization ---
let canvas, ctx, nodes, nodeCount, maxDistance, pinkNodeCount;

function initAnimation() {
    canvas = document.getElementById('canvas');
    if (!canvas) {
        console.error("Canvas element not found!");  // Important check!
        return;
    }
    ctx = canvas.getContext('2d');
    nodes = [];
    nodeCount = 100;
    maxDistance = 100;
    pinkNodeCount = 5;

    resizeCanvas(); // Call resizeCanvas *before* creating nodes

    for (let i = 0; i < nodeCount; i++) {
        nodes.push(new Node());
    }
    for (let i = 0; i < pinkNodeCount; i++) {
        nodes[Math.floor(Math.random() * nodeCount)].color = "#e62a8e";
    }

    animate(); // Start the animation
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Node {
    constructor() {
        this.x = weightedRandom(canvas.width);
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.radius = 2 + Math.random() * 2;
        this.color = '#00aaff';
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

function drawLines() {
   for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x;
            const dy = nodes[i].y - nodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDistance) {
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);

                let gradient;
                if (nodes[i].color !== nodes[j].color) {
                    gradient = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
                    gradient.addColorStop(0, nodes[i].color);
                    gradient.addColorStop(1, nodes[j].color);
                } else {
                    gradient = nodes[i].color;
                }

                let opacity = 1 - dist / maxDistance;
                let strokeStyle;

                if (typeof gradient === 'string') {
                    strokeStyle = 'rgba(' + parseInt(gradient.substring(1, 3), 16) + ',' +
                        parseInt(gradient.substring(3, 5), 16) + ',' +
                        parseInt(gradient.substring(5, 7), 16) + ',' +
                        opacity + ')';
                } else {
                    strokeStyle = gradient;
                }

                ctx.strokeStyle = strokeStyle;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }
}
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    nodes.forEach(node => {
        node.update();
        node.draw();
    });
    drawLines();
    requestAnimationFrame(animate);
}


// --- Initialization (Handles both index and insight pages) ---

if (window.location.pathname.includes('/insights/')) {
    // We're on an insight page. Extract the ID.
    const insightId = window.location.pathname.split('/').pop().replace('.html', '');
    loadInsight(insightId);
} else {
    // We're on the index page.
    Promise.all([
        loadComponent('components/header.html', 'header-container'),
        loadComponent('components/footer.html', 'footer-container')
    ])
    .then(() => loadInsightList())
    .then(() => {
        initAnimation();
        window.addEventListener('resize', resizeCanvas); // Add resize listener here
    })
    .catch(error => console.error("Error during initialization:", error));
}
