import { Network } from '@capacitor/network';
import { Capacitor } from '@capacitor/core';

/**
 * Connectivity utility for managing online/offline state
 * Works on both web and Capacitor platforms
 */

export type ConnectivityStatus = {
  isOnline: boolean;
  connectionType?: string;
};

let currentStatus: ConnectivityStatus = {
  isOnline: navigator.onLine,
  connectionType: 'unknown'
};

const listeners: Array<(status: ConnectivityStatus) => void> = [];

/**
 * Initialize connectivity monitoring
 */
export async function initializeConnectivity(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    // Use Capacitor Network plugin for native platforms
    const status = await Network.getStatus();
    currentStatus = {
      isOnline: status.connected,
      connectionType: status.connectionType
    };

    // Listen for network changes
    Network.addListener('networkStatusChange', (status) => {
      currentStatus = {
        isOnline: status.connected,
        connectionType: status.connectionType
      };
      notifyListeners();
    });
  } else {
    // Use browser navigator.onLine for web
    currentStatus = {
      isOnline: navigator.onLine,
      connectionType: navigator.onLine ? 'wifi' : 'none'
    };

    window.addEventListener('online', () => {
      currentStatus = { isOnline: true, connectionType: 'wifi' };
      notifyListeners();
    });

    window.addEventListener('offline', () => {
      currentStatus = { isOnline: false, connectionType: 'none' };
      notifyListeners();
    });
  }
}

/**
 * Get current connectivity status
 */
export function getConnectivityStatus(): ConnectivityStatus {
  return { ...currentStatus };
}

/**
 * Check if device is online
 */
export function isOnline(): boolean {
  return currentStatus.isOnline;
}

/**
 * Add listener for connectivity changes
 */
export function addConnectivityListener(
  callback: (status: ConnectivityStatus) => void
): () => void {
  listeners.push(callback);
  
  // Return unsubscribe function
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  };
}

/**
 * Notify all listeners of connectivity change
 */
function notifyListeners(): void {
  listeners.forEach(listener => {
    try {
      listener(currentStatus);
    } catch (error) {
      console.error('Error in connectivity listener:', error);
    }
  });
}
