/***************************************************************
 * Wellnesti - Consolidated & Defensive Main JS
 * Replaces fragmented duplicated DOMContentLoaded blocks
 * - No text-to-speech
 * - Graceful when elements are missing
 * - Preserves events/activities/localStorage
 ***************************************************************/

document.addEventListener("DOMContentLoaded", () => {
  // Top-level init
  initNotificationSettings();
  initSpecialOverlays();
  initRandomStatBars();
  initEventManager();
  initActivityManager();
  initCodeInputs();
  initPetTrack();
  initNavbar();
  showWelcomeMessage();
});

/* ----------------------------- Notifications ----------------------------- */
/* Single implementation (no TTS). Uses the bubble if present otherwise console.log. */
let notificationsEnabled = (() => {
  const stored = localStorage.getItem("notificationsEnabled");
  if (stored === null) return true;
  return stored === "true";
})();

function showNotification(message) {
  if (!notificationsEnabled) return;

  // Prefer in-page speech bubble if present
  const speech = document.getElementById("petSpeech");
  const text = document.getElementById("speechText");

  if (speech && text) {
    text.textContent = message;
    speech.classList.add("show");

    // remove 'show' after 5s (keeps DOM space, use CSS to hide visually)
    setTimeout(() => {
      // only remove if the message hasn't changed
      if (text.textContent === message) {
        speech.classList.remove("show");
        text.textContent = ""; // clear text so :empty CSS rules apply
      }
    }, 5000);
    return;
  }

  // Fallback: log (non-intrusive)
  console.log("Notification:", message);
}

/* Notification settings toggle initialization */
function initNotificationSettings() {
  const notificationsButton = document.getElementById("id-overlay");
  if (!notificationsButton) return;

  // initialize text
  notificationsButton.textContent = notificationsEnabled ? "Turn off Notifications" : "Turn on Notifications";

  notificationsButton.addEventListener("click", () => {
    notificationsEnabled = !notificationsEnabled;
    localStorage.setItem("notificationsEnabled", notificationsEnabled);
    notificationsButton.textContent = notificationsEnabled ? "Turn off Notifications" : "Turn on Notifications";

    // Give immediate feedback via in-page bubble if available (or console)
    showNotification(notificationsEnabled ? "Notifications are ON" : "Notifications are OFF");
  });
}

/* ----------------------------- Welcome message ----------------------------- */
function showWelcomeMessage() {
  // Delay slightly so the page looks loaded before the bubble appears
  setTimeout(() => showNotification("Welcome back! I sure missed ya."), 1500);
}

/* ----------------------------- Pet needs logic ----------------------------- */
let petStats = {
  hunger: 80,
  happiness: 60,
  energy: 50,
  eventComing: false
};

function checkPetNeeds() {
  if (!notificationsEnabled) return;
  if (petStats.hunger < 30) { showNotification("I'm hungry! Please feed me!"); return; }
  if (petStats.energy < 25) { showNotification("I'm so tired... can I nap soon?"); return; }
  if (petStats.happiness < 40) { showNotification("I'm feeling a bit lonely. Can we play?"); return; }
  if (petStats.eventComing) {
    showNotification("Hey! You have an event coming up soon!");
    petStats.eventComing = false;
  }
}

// Periodic checks
setInterval(checkPetNeeds, 15000);

// Slowly decay stats
setInterval(() => {
  petStats.hunger = Math.max(0, petStats.hunger - 5);
  petStats.energy = Math.max(0, petStats.energy - 3);
  petStats.happiness = Math.max(0, petStats.happiness - 2);
  // log for debugging
  // console.log("petStats", petStats);
}, 10000);

/* ----------------------------- Stat bars ----------------------------- */
function initRandomStatBars() {
  const bars = document.querySelectorAll(".stats-overlay .bar");
  bars.forEach(bar => {
    const randomMileage = Math.floor(Math.random() * 21) + 5;
    bar.style.height = `${randomMileage * 10}px`;
    bar.textContent = randomMileage;
  });
}

/* ----------------------------- Special overlays ----------------------------- */
/* Handles toggling overlays attached to .special <li> items (defensive) */
function initSpecialOverlays() {
  const specials = document.querySelectorAll(".special");
  if (!specials || specials.length === 0) return;

  specials.forEach(specialLi => {
    const specialIcon = specialLi.querySelector(".special-icon");
    const specialOverlay = specialLi.querySelector(".special-overlay");
    if (!specialIcon || !specialOverlay) return;

    specialOverlay.style.display = "none";

    specialIcon.addEventListener("click", (e) => {
      e.stopPropagation();

      // close others
      specials.forEach(other => {
        if (other !== specialLi) {
          other.classList.remove("active");
          const o = other.querySelector(".special-overlay");
          if (o) o.style.display = "none";
        }
      });

      const isActive = specialLi.classList.toggle("active");
      specialOverlay.style.display = isActive ? "block" : "none";
    });

    // close when clicking outside
    document.addEventListener("click", (e) => {
      if (!specialOverlay.contains(e.target) && !specialIcon.contains(e.target)) {
        specialLi.classList.remove("active");
        specialOverlay.style.display = "none";
      }
    });
  });
}

/* ----------------------------- Event Manager ----------------------------- */
/* Safe, single event manager used across pages (works if elements missing) */
function initEventManager() {
  const addEventBtn = document.getElementById("addEventBtn");
  const addEventForm = document.getElementById("addEventForm");
  const eventList = document.getElementById("eventList");

  if (!addEventBtn || !addEventForm || !eventList) return; // nothing to do on this page

  // load saved events
  let savedEvents = [];
  try {
    savedEvents = JSON.parse(localStorage.getItem("events") || "[]");
    if (!Array.isArray(savedEvents)) savedEvents = [];
  } catch (err) {
    console.error("Failed reading events from localStorage:", err);
    savedEvents = [];
  }

  function renderEvents() {
    eventList.innerHTML = "";
    if (savedEvents.length === 0) {
      const placeholder = document.createElement("div");
      placeholder.className = "event-placeholder";
      placeholder.textContent = "No events yet.";
      eventList.appendChild(placeholder);
      return;
    }

    savedEvents.forEach((event, idx) => {
      const card = document.createElement("div");
      card.className = "event-card";
      card.innerHTML = `
        <img src="${escapeHtml(event.image || 'images/default.png')}" alt="Event Image">
        <p class="event-name">${escapeHtml(event.name)}</p>
        <p class="event-datetime">${escapeHtml(event.time)}<br>${escapeHtml(event.date)}</p>
        <button class="delete-btn" data-index="${idx}">✖</button>
      `;
      eventList.appendChild(card);
    });

    // attach delete handlers
    eventList.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = Number(e.currentTarget.getAttribute("data-index"));
        if (!Number.isFinite(idx)) return;
        savedEvents.splice(idx, 1);
        localStorage.setItem("events", JSON.stringify(savedEvents));
        renderEvents();
        showNotification("Event removed.");
      });
    });
  }

  addEventBtn.addEventListener("click", () => {
    addEventForm.style.display = (addEventForm.style.display === "flex") ? "none" : "flex";
  });

  addEventForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("eventName");
    const timeInput = document.getElementById("eventTime");
    const dateInput = document.getElementById("eventDate");
    const imageInput = document.getElementById("eventImage");

    if (!nameInput || !timeInput || !dateInput) {
      alert("Event form is missing required inputs on the page.");
      return;
    }

    const name = nameInput.value.trim();
    const time = timeInput.value;
    const date = dateInput.value;
    const image = (imageInput && imageInput.value.trim()) ? imageInput.value.trim() : "images/default.png";

    if (!name || !time || !date) {
      alert("Please fill in all required fields.");
      return;
    }

    savedEvents.push({ name, time, date, image });
    localStorage.setItem("events", JSON.stringify(savedEvents));

    addEventForm.reset();
    addEventForm.style.display = "none";
    renderEvents();

    showNotification(`Event added: ${name} on ${date} at ${time}`);
  });

  // first render
  renderEvents();
}

/* ----------------------------- Activity Manager ----------------------------- */
function initActivityManager() {
  const addActivityBtn = document.getElementById("addActivityBtn");
  const addActivityForm = document.getElementById("addActivityForm");
  const activityList = document.getElementById("activityList");

  if (!addActivityBtn || !addActivityForm || !activityList) return;

  let savedActivities = [];
  try {
    savedActivities = JSON.parse(localStorage.getItem("activities") || "[]");
    if (!Array.isArray(savedActivities)) savedActivities = [];
  } catch (err) {
    console.error("Failed reading activities from localStorage:", err);
    savedActivities = [];
  }

  function renderActivities() {
    activityList.innerHTML = "";
    if (savedActivities.length === 0) {
      const placeholder = document.createElement("div");
      placeholder.className = "activity-placeholder";
      placeholder.textContent = "No activities yet.";
      activityList.appendChild(placeholder);
      return;
    }

    savedActivities.forEach((act, idx) => {
      const card = document.createElement("div");
      card.className = "activity-card";
      card.innerHTML = `
        <img src="${escapeHtml(act.image || 'images/default.png')}" alt="Activity Image">
        <p class="activity-name">${escapeHtml(act.name)}</p>
        <p class="activity-datetime">${escapeHtml(act.time)}<br>${escapeHtml(act.date)}</p>
        <button class="delete-activity" data-index="${idx}">✖</button>
      `;
      activityList.appendChild(card);
    });

    activityList.querySelectorAll(".delete-activity").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = Number(e.currentTarget.getAttribute("data-index"));
        if (!Number.isFinite(idx)) return;
        savedActivities.splice(idx, 1);
        localStorage.setItem("activities", JSON.stringify(savedActivities));
        renderActivities();
        showNotification("Activity removed.");
      });
    });
  }

  addActivityBtn.addEventListener("click", () => {
    addActivityForm.style.display = (addActivityForm.style.display === "flex") ? "none" : "flex";
  });

  addActivityForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const nameInput = document.getElementById("activityName");
    const timeInput = document.getElementById("activityTime");
    const dateInput = document.getElementById("activityDate");
    const imageInput = document.getElementById("activityImage");

    if (!nameInput || !timeInput || !dateInput) {
      alert("Activity form is missing required inputs on this page.");
      return;
    }

    const name = nameInput.value.trim();
    const time = timeInput.value;
    const date = dateInput.value;
    const image = (imageInput && imageInput.value.trim()) ? imageInput.value.trim() : "images/default.png";

    if (!name || !time || !date) {
      alert("Please fill in all required fields.");
      return;
    }

    savedActivities.push({ name, time, date, image });
    localStorage.setItem("activities", JSON.stringify(savedActivities));
    addActivityForm.reset();
    addActivityForm.style.display = "none";
    renderActivities();

    showNotification(`Activity added: ${name} on ${date} at ${time}`);
  });

  renderActivities();
}

/* ----------------------------- Code Inputs (4-digit) ----------------------------- */
function initCodeInputs() {
  const inputs = document.querySelectorAll(".code-inputs input");
  if (!inputs || inputs.length === 0) return;

  const redirectURL = "Home.html";

  inputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, "").charAt(0);

      if (e.target.value && index < inputs.length - 1) inputs[index + 1].focus();

      const allFilled = Array.from(inputs).every(i => i.value.length === 1);
      if (allFilled) {
        const code = Array.from(inputs).map(i => i.value).join("");
        console.log("Code entered:", code);
        setTimeout(() => { window.location.href = redirectURL; }, 200);
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && e.target.value === "" && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });
}

/* ----------------------------- Pet track (carousel) ----------------------------- */
function initPetTrack() {
  const track = document.getElementById("petTrack");
  if (!track) return;

  // Load saved pets
  let pets = [];
  try {
    pets = JSON.parse(localStorage.getItem("pets") || "[]");
    if (!Array.isArray(pets)) pets = [];
  } catch {
    pets = [];
  }

  // Clear track before adding pets
  track.innerHTML = "";

  // If no pets exist, show placeholder
  if (pets.length === 0) {
    track.innerHTML = `<p class="no-pets">No pets created yet.</p>`;
    return;
  }

  // Build pet items dynamically
  pets.forEach(pet => {
    const item = document.createElement("div");
    item.className = "pet-item";

    item.innerHTML = `
      <img src="${pet.image}" alt="${pet.name}">
      <p class="pet-name">${pet.name}</p>
    `;

    track.appendChild(item);
  });

  // Clone items for infinite scroll
  const items = Array.from(track.children);
  items.forEach(item => {
    const clone = item.cloneNode(true);
    clone.dataset.cloned = "true";
    track.appendChild(clone);
  });

  document.body.style.overflow = "auto";
  document.documentElement.style.overflow = "auto";
}


/* ----------------------------- Navbar behavior (desktop overlays + mobile links) ----------------------------- */
function initNavbar() {
  const mobile = window.matchMedia("(max-width: 768px)");

  function handleNavBehavior() {
    const isMobile = mobile.matches;

    // Select icons (attempt multiple selectors to accommodate pages where markup differs)
    const newPetImg = document.querySelector(".newpet img");
    const activity = document.querySelector(".activity-icon");
    const special = document.querySelector(".special-icon");
    const stats = document.querySelector(".stats-icon");
    const gear = document.querySelector(".gear-icon");

    // Helper to hide or show overlays
    const overlaySelector = ".activity-overlay, .special-overlay, .stats-overlay, #settingsOverlay";
    const overlays = document.querySelectorAll(overlaySelector);

    if (isMobile) {
      // mobile redirects
      if (newPetImg) newPetImg.onclick = () => (window.location.href = "add.new.html");
      if (activity) activity.onclick = () => (window.location.href = "activities.html");
      if (special) special.onclick = () => (window.location.href = "special.needs.html");
      if (stats) stats.onclick = () => (window.location.href = "stats.html");
      if (gear) gear.onclick = () => (window.location.href = "settings.html");

      overlays.forEach(el => { if (el) el.style.display = "none"; });
    } else {
      // desktop: remove mobile onclick handlers so overlay logic can run
      if (newPetImg) newPetImg.onclick = null;
      if (activity) activity.onclick = null;
      if (special) special.onclick = null;
      if (stats) stats.onclick = null;
      if (gear) gear.onclick = null;

      overlays.forEach(el => { if (el) el.style.display = ""; });
    }
  }

  handleNavBehavior();
  // Re-run when viewport crosses breakpoint
  mobile.addEventListener("change", handleNavBehavior);
}


// =========================================
// ADD NEW PET (SAVE TO LOCALSTORAGE)
// =========================================
document.addEventListener("DOMContentLoaded", () => {
  const petNameInput = document.getElementById("petName");
  const petTypeSelect = document.querySelector("main.new-pet-page select");
  const createPetBtn = document.querySelector(".make-pet-btn");

  if (!createPetBtn) return;

  // Default images mapping (keeps inside handler scope too)
  const petImages = {
    dog: "Images/dog.png",
    cat: "Images/cat.png",
    rabbit: "Images/rabbit.png",
    hamster: "Images/hamster.png",
    goldfish: "Images/goldfish.png",
    parrot: "Images/parrot.png",
    capybara: "Images/capy.png",
    lizard: "Images/lizard.png",
    chicken: "Images/chicken.png",
    "guinea-pig": "Images/guinea.png",
    custom: "Images/custom.png" // fallback
  };

  createPetBtn.addEventListener("click", (e) => {
    // prevent accidental form submissions if button inside form
    e.preventDefault();

    if (!petNameInput || !petTypeSelect) {
      alert("Pet creation inputs are missing on the page.");
      return;
    }

    const petName = petNameInput.value.trim();
    const petType = petTypeSelect.value;

    if (!petName || !petType) {
      alert("Please enter a pet name and choose a pet type.");
      return;
    }

    const petImage = petImages[petType] || "Images/default.png";
    const newPet = { name: petName, type: petType, image: petImage };

    // Save as "currentPet" (for Home page quick load)
    localStorage.setItem("currentPet", JSON.stringify(newPet));

    // Also add to the pets array (collection)
    let pets = [];
    try {
      pets = JSON.parse(localStorage.getItem("pets") || "[]");
      if (!Array.isArray(pets)) pets = [];
    } catch (err) {
      pets = [];
    }

    pets.push(newPet);
    localStorage.setItem("pets", JSON.stringify(pets));

    // go to home (or to a pet profile later)
    window.location.href = "Home.html";
  });
});



// =========================================
// LOAD PET ON HOME PAGE
// =========================================
document.addEventListener("DOMContentLoaded", () => {
  const savedPet = localStorage.getItem("currentPet");
  if (!savedPet) return; // no pet created yet

  const pet = JSON.parse(savedPet);

  // The pet image element on Home.html
  const petImg = document.getElementById("currentPetImage");

  // The pet name element on Home.html
  const petName = document.getElementById("currentPetName");

  // Populate them if they exist
  if (petImg) {
    petImg.src = pet.image;
    petImg.alt = pet.name;
  }

  if (petName) {
    petName.textContent = pet.name;
  }
});

document.addEventListener("DOMContentLoaded", () => {
    const list = document.getElementById("petList");
    if (!list) return;

    let pets = JSON.parse(localStorage.getItem("pets") || "[]");

    pets.forEach((pet, index) => {
        const li = document.createElement("li");

        li.innerHTML = `
            <a href="Home.html" data-index="${index}" class="pet-select">
                <img src="${pet.image}" alt="${pet.name}">
                <p class="pet-label">${pet.name}</p>
            </a>
        `;

        list.appendChild(li);
    });

    // When user selects a pet → set it as currentPet
    document.addEventListener("click", (e) => {
        if (e.target.closest(".pet-select")) {
            e.preventDefault();
            const index = e.target.closest(".pet-select").dataset.index;
            let pets = JSON.parse(localStorage.getItem("pets") || "[]");
            localStorage.setItem("currentPet", JSON.stringify(pets[index]));
            window.location.href = "Home.html";
        }
    });
});


/* ----------------------------- Utilities ----------------------------- */
function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}



