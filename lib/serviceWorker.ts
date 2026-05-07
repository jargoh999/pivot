// Service Worker Registration
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported in this browser');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('ServiceWorker registration successful with scope: ', registration.scope);
    return true;
  } catch (error) {
    console.error('ServiceWorker registration failed: ', error);
    return false;
  }
}

export async function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) return false;
  
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    return true;
  } catch (error) {
    console.error('Failed to unregister service worker: ', error);
    return false;
  }
}
