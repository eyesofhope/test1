/**
 * Syncfusion License Configuration
 * This file handles the registration of Syncfusion Enterprise Edition license
 * Import this file before using any Syncfusion components
 * 
 * Important: This must be imported in index.tsx BEFORE any Syncfusion components
 */

import { registerLicense } from '@syncfusion/ej2-base';

// Your Syncfusion Enterprise Edition License Key
// First try environment variable, then fallback to hardcoded key
const SYNCFUSION_LICENSE_KEY = 
  process.env.REACT_APP_SYNCFUSION_LICENSE_KEY || 
  'Ngo9BigBOggjHTQxAR8/V1JFaF5cXGRCf1JpTXxbf1x1ZF1MZF5bRHFPIiBoS35Rc0RjWXZccHBXR2FZV0V/VEFc';

/**
 * Initialize Syncfusion license
 * Must be called before using any Syncfusion components
 */
export const initializeSyncfusionLicense = (): void => {
  try {
    // Validate license key format
    if (!SYNCFUSION_LICENSE_KEY || SYNCFUSION_LICENSE_KEY.length < 10) {
      console.error('Invalid Syncfusion license key format');
      return;
    }

    // Register the license
    registerLicense(SYNCFUSION_LICENSE_KEY);
    
    // Success confirmation
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Syncfusion Enterprise Edition license registered successfully');
      console.log('📋 License key (first 20 chars):', SYNCFUSION_LICENSE_KEY.substring(0, 20) + '...');
    }
  } catch (error) {
    console.error('❌ Failed to register Syncfusion license:', error);
    console.error('🔍 Please verify your license key is correct and from Syncfusion Enterprise Edition');
  }
};

/**
 * Validate that license registration was successful
 * Call this after components are loaded if needed
 */
export const validateLicenseRegistration = (): boolean => {
  try {
    // This is a simple check - in production you might want more sophisticated validation
    return SYNCFUSION_LICENSE_KEY.length > 10;
  } catch {
    return false;
  }
};

// Auto-register the license when this module is imported
initializeSyncfusionLicense();

export default initializeSyncfusionLicense;