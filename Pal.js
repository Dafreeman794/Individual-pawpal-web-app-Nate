document.addEventListener("DOMContentLoaded", () => {
  // Get ALL special sections
  const specials = document.querySelectorAll(".special");
  let notificationsEnabled = true; // default: notifications ON

  specials.forEach((specialLi) => {
    const specialIcon = specialLi.querySelector(".special-icon");
    const specialOverlay = specialLi.querySelector(".special-overlay");

    if (specialIcon && specialOverlay) {
      // Start hidden
      specialOverlay.style.display = "none";

      // Toggle when clicking icon
      specialIcon.addEventListener("click", (e) => {
        e.stopPropagation();

        // Close all other open overlays first
        document.querySelectorAll(".special.active").forEach((other) => {
          if (other !== specialLi) {
            other.classList.remove("active");
            const otherOverlay = other.querySelector(".special-overlay");
            if (otherOverlay) {
              otherOverlay.classList.remove("slide-down");
              otherOverlay.style.display = "none";
            }
          }
        });

        // Toggle this one
        specialLi.classList.toggle("active");
        if (specialLi.classList.contains("active")) {
          specialOverlay.style.display = "block";
          specialOverlay.classList.add("slide-down");
        } else {
          specialOverlay.classList.remove("slide-down");
          setTimeout(() => (specialOverlay.style.display = "none"), 300);
        }
      });

      // Close when clicking outside
      document.addEventListener("click", (e) => {
        if (!specialOverlay.contains(e.target) && !specialIcon.contains(e.target)) {
          specialLi.classList.remove("active");
          specialOverlay.classList.remove("slide-down");
          setTimeout(() => (specialOverlay.style.display = "none"), 300);
        }
      });
      
    }
  });
});

// Function to show speech bubble notifications
function showNotification(message) {
  const speech = document.getElementById("petSpeech");
  const text = document.getElementById("speechText");

  if (!speech || !text) return;

  text.textContent = message;
  speech.classList.add("show");

  // Optional: Read out loud
  if ('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(message);
    utter.rate = 1.1; // slightly faster, more natural
    utter.pitch = 1.2;
    speechSynthesis.speak(utter);
  }

  // Hide after 5 seconds
  setTimeout(() => {
    speech.classList.remove("show");
  }, 5000);
}

// Example usage:
document.addEventListener("DOMContentLoaded", () => {
  // Example notification on page load
  setTimeout(() => showNotification("Welcome back! Your pet missed you."), 1500);

  // You can trigger this anywhere in your code, e.g.:
  // showNotification("Your pet needs food!");
});

let petStats = {
  hunger: 80,      // 0 = starving, 100 = full
  happiness: 60,   // 0 = sad, 100 = happy
  energy: 50,      // 0 = tired, 100 = energetic
  eventComing: false // true if a scheduled event is near
};

function checkPetNeeds() {
  if (petStats.hunger < 30) {
    showNotification("I'm hungry! Please feed me!");
  } else if (petStats.energy < 25) {
    showNotification("I'm so tired... can I nap soon? ");
  } else if (petStats.happiness < 40) {
    showNotification("I'm feeling a bit lonely. Can we play? ");
  } else if (petStats.eventComing) {
    showNotification("Hey! You have an event coming up soon! ");
    petStats.eventComing = false; // reset so it doesn’t repeat
  }
}

setInterval(() => {
  checkPetNeeds();
}, 15000); // check every 15 seconds (adjust as needed)

setInterval(() => {
  petStats.hunger -= 5;
  petStats.energy -= 3;
  petStats.happiness -= 2;

  // keep values in range 0–100
  Object.keys(petStats).forEach(key => {
    if (petStats[key] < 0) petStats[key] = 0;
    if (petStats[key] > 100) petStats[key] = 100;
  });

  console.log(petStats); // see changes in console
}, 10000); // decrease stats every 10 seconds

document.addEventListener("DOMContentLoaded", () => {
  const bars = document.querySelectorAll(".stats-overlay .bar");

  bars.forEach(bar => {
    // Generate a random mileage between 5 and 25
    const randomMileage = Math.floor(Math.random() * 21) + 5;

    // Update bar height and text
    bar.style.height = `${randomMileage * 10}px`; // scale visually
    bar.textContent = randomMileage;
  });
});

const settingsButton = document.querySelector('.settings');
const settingsOverlay = document.getElementById('settingsOverlay');

settingsButton.addEventListener('click', () => {
  settingsOverlay.classList.toggle('show');
});

// Initialize notificationsEnabled from localStorage if available
let notificationsEnabled = localStorage.getItem("notificationsEnabled");
if (notificationsEnabled === null) {
  notificationsEnabled = true; // default: ON
} else {
  notificationsEnabled = notificationsEnabled === "true"; // convert string to boolean
}

// Select the "Turn off Notifications" button
const notificationsButton = document.getElementById("id-overlay");

// Update button text on page load
notificationsButton.textContent = notificationsEnabled
  ? "Turn off Notifications"
  : "Turn on Notifications";

// Toggle notifications on/off
notificationsButton.addEventListener("click", () => {
  notificationsEnabled = !notificationsEnabled;

  // Save preference in localStorage
  localStorage.setItem("notificationsEnabled", notificationsEnabled);

  // Update button text
  notificationsButton.textContent = notificationsEnabled
    ? "Turn off Notifications"
    : "Turn on Notifications";

  // Optional: Notify user of the change
  showNotification(
    notificationsEnabled
      ? "Notifications are ON"
      : "Notifications are OFF"
  );
});

// Update showNotification function to respect toggle
function showNotification(message) {
  if (!notificationsEnabled) return; // exit if notifications are OFF

  const speech = document.getElementById("petSpeech");
  const text = document.getElementById("speechText");

  if (!speech || !text) return;

  text.textContent = message;
  speech.classList.add("show");

  if ('speechSynthesis' in window) {
    const utter = new SpeechSynthesisUtterance(message);
    utter.rate = 1.1;
    utter.pitch = 1.2;
    speechSynthesis.speak(utter);
  }

  setTimeout(() => {
    speech.classList.remove("show");
  }, 5000);
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