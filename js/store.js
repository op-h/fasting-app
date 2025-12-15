/**
 * Store.js
 * Handles all LocalStorage interactions
 */

const STORAGE_KEY = 'fastingApp_db';

const defaultState = {
  currentFast: {
    isActive: false,
    startTime: null,
    goalHours: 16,
    type: '16:8' // 16:8, 18:6, 20:4, OMAD
  },
  history: [], // Array of completed fasts: { ..., mood: 'Great' }
  weightLogs: [], // Array of { date, weight }
  waterLogs: {}, // Object: { "YYYY-MM-DD": count }
  badges: [], // Array of unlocked badge IDs (strings)
  settings: {
    theme: 'dark',
    weightUnit: 'kg', // or 'lbs'
    notificationsEnabled: false
  },
  userProfile: {
    streak: 0,
    lastFastEnd: null
  }
};

export const FLAGS = {
  BADGES: [
    { id: 'streak_1', label: 'First Step', days: 1, icon: 'fa-shoe-prints' },
    { id: 'streak_3', label: 'Consistency', days: 3, icon: 'fa-walking' },
    { id: 'streak_7', label: 'Week Warrior', days: 7, icon: 'fa-fire' },
    { id: 'streak_14', label: 'Two Weeks', days: 14, icon: 'fa-fire-alt' },
    { id: 'streak_30', label: 'Monthly Master', days: 30, icon: 'fa-calendar-check' },
    { id: 'streak_60', label: 'Two Months', days: 60, icon: 'fa-calendar-alt' },
    { id: 'streak_90', label: 'Seasonal Faster', days: 90, icon: 'fa-leaf' },
    { id: 'streak_180', label: 'Half Year', days: 180, icon: 'fa-star-half-alt' },
    { id: 'streak_365', label: 'Fasting Legend', days: 365, icon: 'fa-crown' }
  ]
};

export const Store = {
  get() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      this.save(defaultState);
      return defaultState;
    }
    try {
      const parsed = JSON.parse(stored);
      // Merge with defaultState
      return {
        ...defaultState,
        ...parsed,
        settings: { ...defaultState.settings, ...parsed.settings },
        // Ensure arrays/objects exist if old data
        waterLogs: parsed.waterLogs || {},
        badges: parsed.badges || []
      };
    } catch (e) {
      console.error("Storage Corrupt", e);
      localStorage.setItem(STORAGE_KEY + '_corrupt_backup', stored);
      this.save(defaultState);
      return defaultState;
    }
  },

  save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  update(updater) {
    const currentData = this.get();
    const newData = updater(currentData);
    this.save(newData);
    return newData;
  },

  // --- Specific Helpers ---

  startFast(startTime, goalHours, type) {
    return this.update(data => {
      data.currentFast = {
        isActive: true,
        startTime: startTime,
        goalHours: goalHours,
        type: type
      };
      return data;
    });
  },

  editStartTime(newStartTime) {
    return this.update(data => {
      if (data.currentFast.isActive) {
        data.currentFast.startTime = newStartTime;
      }
      return data;
    });
  },

  endFast(endTime, mood = null) {
    let newBadges = [];

    return {
      data: this.update(data => {
        if (!data.currentFast.isActive) return data;

        const start = data.currentFast.startTime;
        const durationHours = (endTime - start) / (1000 * 60 * 60);
        const isComplete = durationHours >= data.currentFast.goalHours;
        const hoursSinceLastFast = data.userProfile.lastFastEnd
          ? (start - data.userProfile.lastFastEnd) / (1000 * 60 * 60)
          : 0;

        // History
        data.history.unshift({
          start: start,
          end: endTime,
          duration: durationHours,
          goal: data.currentFast.goalHours,
          type: data.currentFast.type,
          completed: isComplete,
          mood: mood // Mood Logger
        });

        // Streak Logic (Reset > 12h gap)
        const MAX_GAP_HOURS = 12;
        if (data.userProfile.lastFastEnd && hoursSinceLastFast > MAX_GAP_HOURS) {
          // Only reset if gap is large AND it wasn't just a tiny overlap
          data.userProfile.streak = 0;
        }

        if (isComplete) {
          data.userProfile.streak += 1;
        }

        // Check Badges
        FLAGS.BADGES.forEach(badge => {
          if (data.userProfile.streak >= badge.days && !data.badges.includes(badge.id)) {
            data.badges.push(badge.id);
            newBadges.push(badge);
          }
        });

        data.userProfile.lastFastEnd = endTime;

        // Reset
        data.currentFast.isActive = false;
        data.currentFast.startTime = null;

        return data;
      }),
      newBadges: newBadges
    };
  },

  logWeight(weight) {
    return this.update(data => {
      const today = new Date().toISOString().split('T')[0];
      const existingIndex = data.weightLogs.findIndex(l => l.date === today);

      if (existingIndex >= 0) {
        data.weightLogs[existingIndex].weight = parseFloat(weight);
      } else {
        data.weightLogs.push({
          date: today,
          weight: parseFloat(weight),
          timestamp: Date.now()
        });
      }
      data.weightLogs.sort((a, b) => a.timestamp - b.timestamp);
      return data;
    });
  },

  // Hydration
  logWater(amount = 200) {
    return this.update(data => {
      const today = new Date().toISOString().split('T')[0];
      const current = data.waterLogs[today] || 0;
      let newVal = current + amount;
      if (newVal < 0) newVal = 0; // Prevent negative
      data.waterLogs[today] = newVal;
      return data;
    });
  },

  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data && data.history && data.settings) {
        this.save(data);
        return true;
      }
    } catch (e) {
      console.error("Import failed", e);
    }
    return false;
  }
};
