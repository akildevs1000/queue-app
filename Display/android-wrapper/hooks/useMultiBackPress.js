import { useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';

export default function useMultiBackPress({
  pressCount = 3,
  timeout = 2000,
  onReached,
}) {
  const counterRef = useRef(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleBackPress = () => {
      counterRef.current += 1;

      // reset previous timer
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      if (counterRef.current >= pressCount) {
        counterRef.current = 0;
        onReached?.();
        return true;
      }

      // start new timeout for resetting count
      timeoutRef.current = setTimeout(() => {
        counterRef.current = 0;
      }, timeout);

      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => {
      backHandler.remove();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pressCount, timeout, onReached]);
}
