import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Triggers impact haptic feedback with the specified intensity.
 * Use for button taps and interactive elements.
 * 
 * @param style - The intensity of the haptic feedback ('Light', 'Medium', 'Heavy')
 * @default 'Light'
 */
export const triggerImpact = async (style: 'Light' | 'Medium' | 'Heavy' = 'Light'): Promise<void> => {
  try {
    await Haptics.impact({ style: ImpactStyle[style] });
  } catch (error) {
    // Silently handle errors (web platform, permissions denied, etc.)
    // This ensures haptics don't disrupt UX if they fail
  }
};

/**
 * Triggers selection change haptic feedback.
 * Use for toggle switches, radio buttons, and selection changes.
 * Provides a subtle tick sensation.
 */
export const triggerSelection = async (): Promise<void> => {
  try {
    await Haptics.selectionStart();
  } catch (error) {
    // Silently handle errors
  }
};

/**
 * Triggers success notification haptic feedback.
 * Use for successful operations like save completion, refresh completion.
 * Provides a distinctive success pattern.
 */
export const triggerSuccess = async (): Promise<void> => {
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch (error) {
    // Silently handle errors
  }
};
