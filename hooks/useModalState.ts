import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

/**
 * A custom hook for managing modal state with automatic center positioning
 *
 * @param modalWidth The width of the modal (default: 354)
 * @param defaultTopPosition The default top position when not centered (default: 0)
 * @param centerVertically Whether to center the modal vertically (default: true)
 * @returns Modal state and position values
 */
export function useModalState(modalWidth = 354, defaultTopPosition = 0, centerVertically = true) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: defaultTopPosition, left: 0 });

  // Calculate centered position when modal becomes visible
  useEffect(() => {
    if (isVisible) {
      const { width, height } = Dimensions.get('window');

      setPosition({
        // Center horizontally by subtracting half the modal width from half the screen width
        left: (width - modalWidth) / 2,

        // Only center vertically if requested
        top: centerVertically
          ? height / 2 - 200 // Estimate modal height as 400px, so use half of that
          : defaultTopPosition,
      });
    }
  }, [isVisible, modalWidth, defaultTopPosition, centerVertically]);

  // Add event listener for orientation changes to recalculate position
  useEffect(() => {
    const dimensionsChangeHandler = () => {
      if (isVisible) {
        const { width, height } = Dimensions.get('window');

        setPosition({
          left: (width - modalWidth) / 2,
          top: centerVertically ? height / 2 - 200 : defaultTopPosition,
        });
      }
    };

    // Subscribe to dimension changes (e.g., orientation changes)
    const subscription = Dimensions.addEventListener('change', dimensionsChangeHandler);

    // Clean up subscription
    return () => subscription.remove();
  }, [isVisible, modalWidth, defaultTopPosition, centerVertically]);

  const showModal = () => setIsVisible(true);
  const hideModal = () => setIsVisible(false);

  return {
    isVisible,
    showModal,
    hideModal,
    position,
  };
}
