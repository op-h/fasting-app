import { Store, FLAGS } from './store.js';
import { WeightChart } from './charts.js';
import { UI } from './ui.js';

// DOM Elements
const views = {
  dashboard: document.getElementById('view-dashboard'),
  progress: document.getElementById('view-progress'),
  history: document.getElementById('view-history')
};

const navItems = {
  dashboard: document.getElementById('nav-dashboard'),
  progress: document.getElementById('nav-progress'),
  history: document.getElementById('nav-history')
};

// State
let timerInterval = null;

// Initialization
function init() {
  try {
    render();
    setupEventListeners();
    setupTimer();
    updateBodyStatus();

    // Default View
    switchView('dashboard');
  } catch (e) {
    console.error("Init Error:", e);
    // Silent fail safely, or toast if UI ready
    if (window.UI) UI.toast("App error", "error");
  }
}

// Event Listeners
function setupEventListeners() {
  // Navigation
  navItems.dashboard.addEventListener('click', () => switchView('dashboard'));
  navItems.progress.addEventListener('click', () => {
    switchView('progress');
    const data = Store.get();
    WeightChart.init('weightChart', data.weightLogs, data.settings.weightUnit);
  });
  navItems.history.addEventListener('click', () => switchView('history'));

  // Dashboard Actions
  document.getElementById('btn-start-fast').addEventListener('click', async () => {
    const protocolSelect = document.getElementById('fast-protocol');
    let goalHours = parseInt(protocolSelect.value);
    let type = "Custom";

    if (protocolSelect.value === 'custom') {
      const input = await UI.promptNumber("Custom Fast Goal", "Enter hours (e.g. 14)", 16);
      if (!input) return;
      goalHours = parseFloat(input);
      if (isNaN(goalHours) || goalHours <= 0) {
        UI.toast("Invalid hours entered", "error");
        return;
      }
      type = `Custom (${goalHours}h)`;
    } else {
      if (goalHours === 16) type = "16:8 (Leangains)";
      if (goalHours === 18) type = "18:6";
      if (goalHours === 20) type = "20:4 (Warrior)";
      if (goalHours === 23) type = "OMAD";
    }

    Store.startFast(Date.now(), goalHours, type);

    if (Notification.permission === 'default') Notification.requestPermission();
    UI.toast("Fast Started!", "success");
    render();
  });

  document.getElementById('btn-edit-start').addEventListener('click', async () => {
    const data = Store.get();
    if (!data.currentFast.isActive) return;
    const result = await UI.promptDate("Edit Start Time", data.currentFast.startTime);
    if (result) {
      const newTs = new Date(result).getTime();
      if (!isNaN(newTs)) {
        Store.editStartTime(newTs);
        UI.toast("Start time updated");
        render();
      }
    }
  });

  // End Fast (Updated with Mood)
  document.getElementById('btn-end-fast').addEventListener('click', async () => {
    const confirmEnd = await UI.confirm("End Fasting?", "Are you sure you want to end your current fast?");
    if (confirmEnd) {
      // 1. Ask Mood
      const mood = await UI.promptSelection("How do you feel?", [
        { label: "Energized", value: "Energized", icon: "fa-bolt" },
        { label: "Good", value: "Good", icon: "fa-smile" },
        { label: "Tired", value: "Tired", icon: "fa-tired" },
        { label: "Hungry", value: "Hungry", icon: "fa-hamburger" },
        { label: "Dizzy", value: "Dizzy", icon: "fa-dizzy" }
      ]);

      const data = Store.get();
      const elapsed = (Date.now() - data.currentFast.startTime) / (1000 * 60 * 60);
      const isSuccess = elapsed >= data.currentFast.goalHours;

      // 2. End Fast
      const result = Store.endFast(Date.now(), mood);
      // result = { data: ..., newBadges: [] }

      render();

      // 3. New Badge Alert
      if (result.newBadges.length > 0) {
        // Show badge modal
        UI.confetti();
        await UI.alert("🏅 New Achievement!", `You unlocked: ${result.newBadges[0].label}`, "fa-crown");
      }

      if (isSuccess) {
        UI.confetti();
        if (!result.newBadges.length) {
          // Only show generic success if no badge (don't spam modals)
          await UI.alert("🎉 Fast Completed!", "Great job keeping your streak!", "fa-trophy");
        }
      } else {
        UI.toast("Fast ended early", "success");
      }

      if (navigator.vibrate) navigator.vibrate([50]);
    }
  });

  // Weight Log
  document.getElementById('btn-log-weight').addEventListener('click', () => {
    const weightInput = document.getElementById('weight-input').value;
    if (weightInput) {
      const newData = Store.logWeight(weightInput);
      WeightChart.update(newData.weightLogs);
      document.getElementById('weight-input').value = '';
      UI.toast("Weight logged");
    }
  });

  // Water Log
  document.getElementById('btn-add-water').addEventListener('click', () => {
    Store.logWater(200); // 200ml
    render();
    UI.toast("200ml Added 💧");
  });

  document.getElementById('btn-remove-water').addEventListener('click', () => {
    const data = Store.get();
    const today = new Date().toISOString().split('T')[0];
    const current = data.waterLogs[today] || 0;

    if (current > 0) {
      Store.logWater(-200);
      render();
      UI.toast("Entry Removed");
    }
  });

  // Export Data
  document.getElementById('btn-export-data').addEventListener('click', () => {
    const data = Store.get();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "fasting_backup_" + Date.now() + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  });

  // Import Data
  const fileInput = document.getElementById('file-import');
  document.getElementById('btn-import-data').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      if (Store.importData(content)) {
        alert("Data imported successfully! The app will now reload.");
        location.reload();
      } else {
        UI.alert("Error", "Invalid data file.", "fa-exclamation-triangle");
      }
    };
    reader.readAsText(file);
  });
}

function switchView(viewName) {
  Object.values(views).forEach(el => el.classList.add('hidden'));
  Object.values(navItems).forEach(el => {
    el.classList.remove('text-emerald-400');
    el.classList.add('text-slate-400');
  });
  views[viewName].classList.remove('hidden');
  views[viewName].classList.add('fade-enter-active');
  navItems[viewName].classList.remove('text-slate-400');
  navItems[viewName].classList.add('text-emerald-400');
}

function render() {
  const data = Store.get();

  // Dashboard Logic
  document.getElementById('streak-count').textContent = `${data.userProfile.streak} Day Streak`;

  // Hydration
  const today = new Date().toISOString().split('T')[0];
  const water = data.waterLogs[today] || 0;

  // Update Render in ML
  document.getElementById('water-count').textContent = water;
  const percentage = Math.min(100, (water / 2000) * 100);
  const progressBar = document.getElementById('water-progress-bar');
  if (progressBar) progressBar.style.width = `${percentage}%`;

  const timerContainer = document.getElementById('timer-container');
  const controlsStart = document.getElementById('controls-start');
  const controlsEnd = document.getElementById('controls-end');
  const statusText = document.getElementById('status-text');

  if (data.currentFast.isActive) {
    controlsStart.classList.add('hidden');
    controlsEnd.classList.remove('hidden');
    statusText.textContent = "You are Fasting";
    statusText.classList.add('text-emerald-400');
    statusText.classList.remove('text-slate-400');
    document.getElementById('body-status-card').classList.remove('hidden');
  } else {
    controlsStart.classList.remove('hidden');
    controlsEnd.classList.add('hidden');
    statusText.textContent = "Ready to Fast?";
    statusText.classList.remove('text-emerald-400');
    statusText.classList.add('text-slate-400');

    document.getElementById('timer-display').textContent = "00:00:00";
    setProgress(0);
    document.getElementById('timer-subtext').textContent = "Start whenever you're ready";

    // Hide body status if not fasting (or show summary?)
    // Let's hide it to keep dashboard clean
    // document.getElementById('body-status-card').classList.add('hidden');
    // Actually, let's show "Fed State"
    updateBodyStatusUI(0);
  }

  // History Render
  const historyList = document.getElementById('history-list');
  historyList.innerHTML = '';

  if (data.history.length === 0) {
    historyList.innerHTML = '<div class="text-center text-slate-500 py-8">No fasts completed yet.</div>';
  } else {
    data.history.forEach((fast, index) => {
      const date = new Date(fast.end).toLocaleDateString();
      const successClass = fast.completed ? 'border-emerald-500/30' : 'border-red-500/30';
      const moodIcon = fast.mood ? `<span class="ml-2 text-xs bg-slate-700 px-2 py-1 rounded-full text-slate-300">${fast.mood}</span>` : '';

      const item = document.createElement('div');
      item.className = `glass p-4 rounded-xl border ${successClass} mb-3 flex justify-between items-center animate-slide-in`;
      // Stagger effect: 50ms delay per item
      item.style.animationDelay = `${index * 50}ms`;
      
      item.innerHTML = `
            <div>
                  <div class="text-white font-medium flex items-center">${fast.type} Fast ${moodIcon}</div>
                  <div class="text-xs text-slate-400">${date} • ${fast.duration.toFixed(1)} hrs</div>
              </div>
            <div class="text-xl text-slate-500">
               ${fast.completed ? '<i class="fas fa-check text-emerald-500"></i>' : '<i class="fas fa-times text-red-500"></i>'}
            </div>
          `;
      historyList.appendChild(item);
    });
  }

  // Badges Render
  const badgesGrid = document.getElementById('badges-grid');
  badgesGrid.innerHTML = '';
  FLAGS.BADGES.forEach(badge => {
    const isUnlocked = data.badges.includes(badge.id);
    const el = document.createElement('div');
    el.className = `aspect-square rounded-xl flex flex-col items-center justify-center p-2 text-center border ${isUnlocked ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-slate-800/50 border-slate-700 opacity-50'}`;
    el.innerHTML = `
        <i class="fas ${badge.icon} text-xl mb-1 ${isUnlocked ? 'text-emerald-400' : 'text-slate-600'}"></i>
        <span class="text-[9px] leading-tight text-slate-300 font-bold">${badge.days} Days</span>
      `;
    badgesGrid.appendChild(el);
  });

  // Summary
  const latestWeight = data.weightLogs.length > 0 ? data.weightLogs[data.weightLogs.length - 1].weight : '--';
  document.getElementById('current-weight-display').textContent = `${latestWeight} ${data.settings.weightUnit}`;
}

// Timer & Circadian Visual
function setupTimer() {
  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    const data = Store.get();

    // Circadian Check
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 18;
    const circadianIcon = document.getElementById('circadian-icon');
    if (!circadianIcon) {
      const container = document.getElementById('timer-container');
      if (container) {
        const icon = document.createElement('div');
        icon.id = 'circadian-icon';
        icon.className = 'absolute top-4 right-10 text-xl animate-pulse z-20';
        container.appendChild(icon);
      }
    } else {
      circadianIcon.innerHTML = isDay ? '<i class="fas fa-sun text-yellow-500"></i>' : '<i class="fas fa-moon text-blue-400"></i>';
    }


    if (data.currentFast.isActive) {
      const now = Date.now();
      const start = data.currentFast.startTime;
      const goalMillis = data.currentFast.goalHours * 60 * 60 * 1000;
      const elapsed = now - start;
      const elapsedHours = elapsed / (1000 * 60 * 60);

      const hours = Math.floor(elapsed / (1000 * 60 * 60));
      const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);

      document.getElementById('timer-display').textContent =
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      // Progress
      const percent = Math.min(100, (elapsed / goalMillis) * 100);
      setProgress(percent);

      // Subtext
      const timeLeft = goalMillis - elapsed;
      if (timeLeft > 0) {
        const hLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const mLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        document.getElementById('timer-subtext').textContent = `Goal reached in ${hLeft}h ${mLeft}m`;
      } else {
        document.getElementById('timer-subtext').textContent = "Goal Reached!";
      }

      // Update Body Status
      updateBodyStatusUI(elapsedHours);

    }
  }, 1000);
}

function setProgress(percent) {
  const circle = document.querySelector('.timer-ring-circle');
  const circumference = 282.7;
  const offset = circumference - (percent / 100) * circumference;
  circle.style.strokeDashoffset = offset;
  circle.style.opacity = percent <= 0 ? '0' : '1';
}

function updateBodyStatus() {
  // Initial call
}

function updateBodyStatusUI(hours) {
  const title = document.getElementById('body-status-title');
  const desc = document.getElementById('body-status-desc');
  
  if (!title || !desc) return; // Safety check

  // Stages
  if (hours < 4) {
    title.textContent = "Anabolic Stage (0-4h)";
    desc.textContent = "Your body is digesting food and using it for energy.";
  } else if (hours < 12) {
    title.textContent = "Catabolic Stage (4-12h)";
    desc.textContent = "Blood sugar falls. The body starts using stored glycogen.";
  } else if (hours < 18) {
    title.textContent = "Ketosis (12-18h)";
    desc.textContent = "Fat burning mode activated! Your body is using ketones.";
    title.className = "text-xs text-orange-400";
  } else if (hours < 24) {
    title.textContent = "Autophagy (18-24h)";
    desc.textContent = "Cellular cleanup. Recycling old cells for new ones.";
    title.className = "text-xs text-emerald-400";
  } else if (hours < 48) {
    title.textContent = "Growth Hormone (24h+)";
    desc.textContent = "HGH levels rise. Fat burning is optimal.";
    title.className = "text-xs text-purple-400";
  } else {
    title.textContent = "Deep Fasting";
    desc.textContent = "Maximum cellular repair and insulin sensitivity.";
  }
}

// Start
console.log("Main.js loaded");
document.addEventListener('DOMContentLoaded', init);
