
document.addEventListener("DOMContentLoaded", () => {
  initSpecialOverlays();
  initNotificationSettings();
  initRandomStatBars();
  initEventManager();
  initCodeInputs();
  showWelcomeMessage();
  initNavbar(); 
});


let notificationsEnabled = localStorage.getItem("notificationsEnabled");
notificationsEnabled = notificationsEnabled === null ? true : notificationsEnabled === "true";

function showNotification(message) {
  if (!notificationsEnabled) return;

  const speech = document.getElementById("petSpeech");
  const text = document.getElementById("speechText");
  if (!speech || !text) return;

  text.textContent = message;
  speech.classList.add("show");

  // Prevent overlapping speech
  if ("speechSynthesis" in window) {
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(message);
    utter.rate = 1.1;
    utter.pitch = 1.2;
    speechSynthesis.speak(utter);
  }

  setTimeout(() => speech.classList.remove("show"), 5000);
}

// Initial message
function showWelcomeMessage() {
  setTimeout(() => showNotification("Welcome back! Your pet missed you."), 1500);
}

// Toggle notifications in Settings
function initNotificationSettings() {
  const notificationsButton = document.getElementById("id-overlay");

  notificationsButton.textContent = notificationsEnabled
    ? "Turn off Notifications"
    : "Turn on Notifications";

  notificationsButton.addEventListener("click", () => {
    notificationsEnabled = !notificationsEnabled;
    localStorage.setItem("notificationsEnabled", notificationsEnabled);
    notificationsButton.textContent = notificationsEnabled
      ? "Turn off Notifications"
      : "Turn on Notifications";

    showNotification(
      notificationsEnabled ? "Notifications are ON" : "Notifications are OFF"
    );
  });
}


let petStats = {
  hunger: 80,
  happiness: 60,
  energy: 50,
  eventComing: false
};

function checkPetNeeds() {
  if (petStats.hunger < 30) return showNotification("I'm hungry! Please feed me!");
  if (petStats.energy < 25) return showNotification("I'm so tired... can I nap soon?");
  if (petStats.happiness < 40) return showNotification("I'm feeling a bit lonely. Can we play?");
  if (petStats.eventComing) {
    showNotification("Hey! You have an event coming up soon!");
    petStats.eventComing = false;
  }
}

// Check needs every 15 seconds
setInterval(checkPetNeeds, 15000);

// Slowly reduce stats every 10 seconds
setInterval(() => {
  petStats.hunger -= 5;
  petStats.energy -= 3;
  petStats.happiness -= 2;

  // Keep values in range
  Object.keys(petStats).forEach(key => {
    petStats[key] = Math.max(0, Math.min(petStats[key], 100));
  });

  console.log(petStats);
}, 10000);


function initRandomStatBars() {
  const bars = document.querySelectorAll(".stats-overlay .bar");

  bars.forEach(bar => {
    const randomMileage = Math.floor(Math.random() * 21) + 5;
    bar.style.height = `${randomMileage * 10}px`;
    bar.textContent = randomMileage;
  });
}



function initSpecialOverlays() {
  const specials = document.querySelectorAll(".special");

  specials.forEach(specialLi => {
    const specialIcon = specialLi.querySelector(".special-icon");
    const specialOverlay = specialLi.querySelector(".special-overlay");
    if (!specialIcon || !specialOverlay) return;

    specialOverlay.style.display = "none";

    specialIcon.addEventListener("click", e => {
      e.stopPropagation();

      specials.forEach(other => {
        if (other !== specialLi) {
          other.classList.remove("active");
          const overlay = other.querySelector(".special-overlay");
          if (overlay) overlay.style.display = "none";
        }
      });

      specialLi.classList.toggle("active");
      specialOverlay.style.display = specialLi.classList.contains("active") ? "block" : "none";
    });

    document.addEventListener("click", e => {
      if (!specialOverlay.contains(e.target) && !specialIcon.contains(e.target)) {
        specialLi.classList.remove("active");
        specialOverlay.style.display = "none";
      }
    });
  });
}



function initEventManager() {
  const addEventBtn = document.getElementById("addEventBtn");
  const addEventForm = document.getElementById("addEventForm");
  const eventList = document.getElementById("eventList");

  let savedEvents = JSON.parse(localStorage.getItem("events") || "[]");

  function renderEvents() {
    eventList.innerHTML = "";
    savedEvents.forEach((event, index) => {
      const card = document.createElement("div");
      card.classList.add("event-card");
      card.innerHTML = `
        <img src="${event.image}" alt="Event Image">
        <p>${event.name}</p>
        <p>${event.time}<br>${event.date}</p>
        <button class="delete-btn" data-index="${index}">✖</button>
      `;
      eventList.appendChild(card);
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        savedEvents.splice(e.target.getAttribute("data-index"), 1);
        localStorage.setItem("events", JSON.stringify(savedEvents));
        renderEvents();
      });
    });
  }

  addEventBtn.addEventListener("click", () => {
    addEventForm.style.display = addEventForm.style.display === "none" ? "flex" : "none";
  });

  addEventForm.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("eventName").value.trim();
    const time = document.getElementById("eventTime").value;
    const date = document.getElementById("eventDate").value;
    const image = document.getElementById("eventImage").value || "images/default.png";
    if (!name || !time || !date) return alert("Please fill in all required fields.");

    savedEvents.push({ name, time, date, image });
    localStorage.setItem("events", JSON.stringify(savedEvents));

    addEventForm.reset();
    addEventForm.style.display = "none";
    renderEvents();
  });

  renderEvents();
}



function initCodeInputs() {
  const inputs = document.querySelectorAll(".code-inputs input");
  const redirectURL = "Home.html";

  inputs.forEach((input, index) => {
    input.addEventListener("input", e => {
      e.target.value = e.target.value.replace(/[^0-9]/g, "").charAt(0);

      if (e.target.value && index < inputs.length - 1) inputs[index + 1].focus();

      if (Array.from(inputs).every(i => i.value.length === 1)) {
        const code = Array.from(inputs).map(i => i.value).join("");
        console.log("Code entered:", code);
        setTimeout(() => (window.location.href = redirectURL), 200);
      }
    });

    input.addEventListener("keydown", e => {
      if (e.key === "Backspace" && input.value === "" && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });
}


document.addEventListener("DOMContentLoaded", () => {
  const addEventBtn = document.getElementById("addEventBtn");
  const addEventForm = document.getElementById("addEventForm");
  const eventList = document.getElementById("eventList");

  // 🔹 Load saved events from localStorage
  let savedEvents = JSON.parse(localStorage.getItem("events") || "[]");

  function renderEvents() {
    eventList.innerHTML = ""; // clear existing
    savedEvents.forEach((event, index) => {
      const card = document.createElement("div");
      card.classList.add("event-card");
      card.innerHTML = `
        <img src="${event.image}" alt="Event Image">
        <p>${event.name}</p>
        <p>${event.time}<br>${event.date}</p>
        <button class="delete-btn" data-index="${index}">✖</button>
      `;
      eventList.appendChild(card);
    });

    // Add delete button handlers
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = e.target.getAttribute("data-index");
        deleteEvent(index);
      });
    });
  }

  function deleteEvent(index) {
    savedEvents.splice(index, 1); // remove from array
    localStorage.setItem("events", JSON.stringify(savedEvents));
    renderEvents(); // re-render UI
  }

  // 🔹 Show/hide form
  addEventBtn.addEventListener("click", () => {
    addEventForm.style.display =
      addEventForm.style.display === "none" ? "flex" : "none";
  });

  // 🔹 Handle add form submission
  addEventForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("eventName").value.trim();
    const time = document.getElementById("eventTime").value;
    const date = document.getElementById("eventDate").value;
    const image = document.getElementById("eventImage").value || "images/default.png";

    if (!name || !time || !date) {
      alert("Please fill in all required fields.");
      return;
    }

    // Save event
    const newEvent = { name, time, date, image };
    savedEvents.push(newEvent);
    localStorage.setItem("events", JSON.stringify(savedEvents));

    // Reset form + re-render
    addEventForm.reset();
    addEventForm.style.display = "none";
    renderEvents();
  });

  // Initial render
  renderEvents();
});

// Wait until DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Select all the inputs in the code section
  const inputs = document.querySelectorAll(".code-inputs input");

  // Set the page to redirect to after the code is filled
  const redirectURL = "Home.html"; // make sure this file exists

  // Loop through each input
  inputs.forEach((input, index) => {
    // Handle user input
    input.addEventListener("input", (e) => {
      let value = e.target.value;

      // Allow only numbers
      value = value.replace(/[^0-9]/g, "");
      e.target.value = value;

      // Make sure only one digit is in the input
      if (value.length > 1) {
        e.target.value = value.charAt(0);
      }

      // Automatically move focus to next input if available
      if (value && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }

      // Check if all inputs are filled
      const allFilled = Array.from(inputs).every(i => i.value.length === 1);

      if (allFilled) {
        // Optional: get the code
        const code = Array.from(inputs).map(i => i.value).join("");
        console.log("Code entered:", code);

        // Redirect to Home.html after a tiny delay to ensure last digit registers
        setTimeout(() => {
          window.location.href = redirectURL;
        }, 200);
      }
    });

    // Allow user to go back using Backspace
    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && e.target.value === "" && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });
});



document.addEventListener("DOMContentLoaded", () => {
  const addActivityBtn = document.getElementById("addActivityBtn");
  const addActivityForm = document.getElementById("addActivityForm");
  const activityList = document.getElementById("activityList");

  if (!addActivityBtn || !addActivityForm || !activityList) return; // skip if not on this page

  // Load saved activities
  let savedActivities = JSON.parse(localStorage.getItem("activities") || "[]");

  function renderActivities() {
    activityList.innerHTML = "";
    savedActivities.forEach((activity, index) => {
      const card = document.createElement("div");
      card.classList.add("activity-card");
      card.innerHTML = `
        <img src="${activity.image}" alt="Activity Image">
        <p>${activity.name}</p>
        <p>${activity.time}<br>${activity.date}</p>
        <button class="delete-activity" data-index="${index}">✖</button>
      `;
      activityList.appendChild(card);
    });

    // Delete functionality
    document.querySelectorAll(".delete-activity").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = e.target.getAttribute("data-index");
        deleteActivity(index);
      });
    });
  }

  function deleteActivity(index) {
    savedActivities.splice(index, 1);
    localStorage.setItem("activities", JSON.stringify(savedActivities));
    renderActivities();
  }

  // Show/hide add form
  addActivityBtn.addEventListener("click", () => {
    addActivityForm.style.display =
      addActivityForm.style.display === "none" ? "flex" : "none";
  });

  // Add new activity
  addActivityForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("activityName").value.trim();
    const time = document.getElementById("activityTime").value;
    const date = document.getElementById("activityDate").value;
    const image = document.getElementById("activityImage").value || "images/default.png";

    if (!name || !time || !date) {
      alert("Please fill in all required fields.");
      return;
    }

    const newActivity = { name, time, date, image };
    savedActivities.push(newActivity);
    localStorage.setItem("activities", JSON.stringify(savedActivities));

    addActivityForm.reset();
    addActivityForm.style.display = "none";
    renderActivities();
  });

  // Initial render
  renderActivities();
});

//pet selection.js//
const track = document.getElementById('petTrack');
    const items = Array.from(track.children);

    // Clone items until we fill twice the width for a smooth infinite loop
    items.forEach(item => {
      const clone = item.cloneNode(true);
      track.appendChild(clone);
    });

    document.body.style.overflow = "auto";
document.documentElement.style.overflow = "auto";

document.addEventListener("DOMContentLoaded", function () {
  const mobile = window.matchMedia("(max-width: 768px)");

  function handleNavBehavior() {
    const isMobile = mobile.matches;

    // Select navbar items
    const activity = document.querySelector(".activity-icon");
    const special = document.querySelector(".special-icon");
    const stats = document.querySelector(".stats-icon");
    const gear = document.querySelector(".gear-icon");

    if (isMobile) {
      // MOBILE MODE — make icons link to pages
      activity.onclick = () => (window.location.href = "activities.html");
      special.onclick = () => (window.location.href = "special.needs.html");
      stats.onclick = () => (window.location.href = "stats.html");
      gear.onclick = () => (window.location.href = "settings.html");

      // Hide overlays on mobile
      document.querySelectorAll(".activity-overlay, .special-overlay, .stats-overlay, #settingsOverlay")
        .forEach(el => el.style.display = "none");
    } else {
      // DESKTOP MODE — overlays behave normally
      activity.onclick = null;
      special.onclick = null;
      stats.onclick = null;
      gear.onclick = null;

      // You can restore hover/overlay behavior if you use JS toggles
      document.querySelectorAll(".activity-overlay, .special-overlay, .stats-overlay, #settingsOverlay")
        .forEach(el => el.style.display = "");
    }
  }

  // Run on load and whenever screen resizes
  handleNavBehavior();
  mobile.addEventListener("change", handleNavBehavior);
});

function initNavbar() {
  const mobile = window.matchMedia("(max-width: 768px)");

  function handleNavBehavior() {
    const isMobile = mobile.matches;

    // Select navbar items
    const activity = document.querySelector(".activity-icon");
    const special = document.querySelector(".special-icon");
    const stats = document.querySelector(".stats-icon");
    const gear = document.querySelector(".gear-icon");

    if (!activity || !special || !stats || !gear) return;

    if (isMobile) {
      // MOBILE MODE — redirect to pages
      activity.onclick = () => (window.location.href = "activities.html");
      special.onclick = () => (window.location.href = "special.needs.html");
      stats.onclick = () => (window.location.href = "stats.html");
      gear.onclick = () => (window.location.href = "settings.html");

      document.querySelectorAll(".activity-overlay, .special-overlay, .stats-overlay, #settingsOverlay")
        .forEach(el => el && (el.style.display = "none"));
    } else {
      // DESKTOP — dropdown overlays
      activity.onclick = null;
      special.onclick = null;
      stats.onclick = null;
      gear.onclick = null;

      document.querySelectorAll(".activity-overlay, .special-overlay, .stats-overlay, #settingsOverlay")
        .forEach(el => el && (el.style.display = ""));
    }
  }

  handleNavBehavior();
  mobile.addEventListener("change", handleNavBehavior);
}



