// ============================================
// VERSE — Toast Notification System
// ============================================

let toastTimeout;

export function showToast(message) {
  let toast = document.getElementById('verse-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.id = 'verse-toast';
    document.body.appendChild(toast);
  }

  // Clear any existing timeout
  if (toastTimeout) clearTimeout(toastTimeout);

  toast.textContent = message;
  toast.classList.remove('show');

  // Force reflow
  void toast.offsetHeight;

  toast.classList.add('show');

  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}
