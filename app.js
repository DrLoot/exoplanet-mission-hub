const missionGrid = document.getElementById("missionGrid");
const statsBar = document.getElementById("statsBar");
const searchInput = document.getElementById("searchInput");
const tabButtons = document.querySelectorAll("[data-status]");

let missions = [];
let currentStatus = "Active";

async function loadMissions() {
  try {
    const response = await fetch("missions.json");

    if (!response.ok) {
      throw new Error("Could not load missions.json");
    }

    missions = await response.json();

    renderStats();
    renderMissions();
  } catch (error) {
    missionGrid.innerHTML = `
      <div class="error-card">
        <h2>Mission data unavailable</h2>
        <p>${error.message}</p>
      </div>
    `;
  }
}

function renderStats() {
  const activeCount = missions.filter(mission => mission.status === "Active").length;
  const upcomingCount = missions.filter(mission => mission.status === "Upcoming").length;
  const retiredCount = missions.filter(mission => mission.status === "Retired").length;

  statsBar.innerHTML = `
    <div class="stat-card">
      <strong>${activeCount}</strong>
      <span>Active Missions</span>
    </div>
    <div class="stat-card">
      <strong>${upcomingCount}</strong>
      <span>Upcoming Missions</span>
    </div>
    <div class="stat-card">
      <strong>${retiredCount}</strong>
      <span>Retired Missions</span>
    </div>
  `;
}

function renderMissions() {
  const searchTerm = searchInput.value.toLowerCase().trim();

  const filteredMissions = missions.filter(mission => {
    const matchesStatus = mission.status === currentStatus;

    const searchableText = `
      ${mission.name}
      ${mission.agency}
      ${mission.status}
      ${mission.category}
      ${mission.location}
      ${mission.description}
      ${mission.epwRelevance}
    `.toLowerCase();

    const matchesSearch = searchableText.includes(searchTerm);

    return matchesStatus && matchesSearch;
  });

  if (filteredMissions.length === 0) {
    missionGrid.innerHTML = `
      <div class="empty-card">
        <h2>No missions found</h2>
        <p>Try another search or select a different tab.</p>
      </div>
    `;
    return;
  }

  missionGrid.innerHTML = filteredMissions
    .map(mission => createMissionCard(mission))
    .join("");
}

function createMissionCard(mission) {
  const statusClass = `badge-${mission.status.toLowerCase()}`;

  const trackerLinks =
    mission.trackerLinks && mission.trackerLinks.length > 0
      ? mission.trackerLinks
          .map(link => {
            return `<a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.label}</a>`;
          })
          .join("")
      : `<span class="mission-meta">No tracker links listed yet</span>`;

  return `
    <article class="mission-card">
      <img 
        class="mission-image" 
        src="${mission.image}" 
        alt="${mission.name}"
        onerror="this.src='./images/placeholder.png'"
      />

      <div class="mission-content">
        <h2 class="mission-title">${mission.name}</h2>

        <div class="mission-meta">
          ${mission.agency}
        </div>

        <div class="badges">
          <span class="badge ${statusClass}">${mission.status}</span>
          <span class="badge badge-category">${mission.category}</span>
        </div>

        <p class="mission-description">
          ${mission.description}
        </p>

        <div class="mission-details">
          <div><span>Launch:</span> ${formatDate(mission.launchDate)}</div>
          <div><span>Mission Start:</span> ${formatDate(mission.missionStart)}</div>
          <div><span>Mission End:</span> ${formatDate(mission.missionEnd)}</div>
          <div><span>Location:</span> ${mission.location || "Unknown"}</div>
        </div>

        <div class="epw-relevance">
          <strong>EPW Relevance:</strong><br />
          ${mission.epwRelevance}
        </div>

        <div class="tracker-links">
          ${trackerLinks}
        </div>
      </div>
    </article>
  `;
}

function formatDate(dateString) {
  if (!dateString) return "TBD";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

tabButtons.forEach(button => {
  button.addEventListener("click", () => {
    tabButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    currentStatus = button.dataset.status;
    renderMissions();
  });
});

searchInput.addEventListener("input", renderMissions);

loadMissions();
