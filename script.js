// --- (Canvas animation code - NO CHANGES HERE) ---
// --- Canvas Animation (remains largely the same) ---
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let nodes = [];
const nodeCount = 100;
const maxDistance = 100;
const pinkNodeCount = 5; // Number of pink nodes

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

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

for (let i = 0; i < nodeCount; i++) {
    nodes.push(new Node());
}
for (let i = 0; i < pinkNodeCount; i++) {
    nodes[Math.floor(Math.random() * nodeCount)].color = "#e62a8e";
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


// --- Component Loading ---
function loadComponent(url, containerId) {
    return fetch(url)
        .then(response => response.text())
        .then(html => {
            document.getElementById(containerId).innerHTML = html;
        })
        .catch(error => console.error('Error loading component:', error));
}

// --- Dynamic Insight Loading (using iframe) ---
function loadInsight(insightId) {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `<iframe src="insights/template.html?id=${insightId}" width="100%" height="800px" frameborder="0"></iframe>`;
}

function loadInsightList() {
    return fetch('insights/list.json')
      .then(response => response.json())
      .then(insights => {
        const listElement = document.getElementById('insight-links');
        insights.forEach(insight => {
          const listItem = document.createElement('li');
          const link = document.createElement('a');
          link.href = '#';
          link.textContent = insight.title;
          link.addEventListener('click', (event) => {
            event.preventDefault();
            loadInsight(insight.id);
          });
          listItem.appendChild(link);
          listElement.appendChild(listItem);
        });
      })
      .catch(error => console.error('Error fetching insight list:', error));
}

// --- Initialization ---
if (window.location.pathname === '/insights/template.html') {
  // We are INSIDE the iframe. Load header, footer, and content.
  const urlParams = new URLSearchParams(window.location.search);
  const insightId = urlParams.get('id');

  if (insightId) {
    fetch(`${insightId}.json`)
      .then(response => response.json())
      .then(data => {
        document.getElementById('report-content').innerHTML = data.report_content;
      })
      .catch(error => {
        console.error('Error fetching insight data:', error);
        document.getElementById('report-content').innerHTML = '<p>Insight data not found.</p>';
      });
  } else {
    document.getElementById('report-content').innerHTML = '<p>No insight ID specified.</p>';
  }
    loadComponent('../components/header.html', 'header-container');
	loadComponent('../components/footer.html', 'footer-container');
}else {
    // We're on the index page.  Load header and footer, *then* the list and animation.
    Promise.all([
        loadComponent('components/header.html', 'header-container'),
        loadComponent('components/footer.html', 'footer-container')
    ])
    .then(() => {
        // *Now* that the header and footer are loaded, load the insight list.
        return loadInsightList();
    })
    .then(() => {
        //  Finally, start the animation.
        animate();
    })
    .catch(error => console.error("Error during initialization:", error));
}
