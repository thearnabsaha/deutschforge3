/**
 * Network status hook using @react-native-community/netinfo
 */
import { useState, useEffect } from "react";
import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";

export function useIsOnline(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Get initial state
    NetInfo.fetch().then((state: NetInfoState) => {
      setIsOnline(state.isConnected === true && state.isInternetReachable !== false);
    });

    const unsub = NetInfo.addEventListener((state: NetInfoState) => {
      setIsOnline(state.isConnected === true && state.isInternetReachable !== false);
    });

    return () => unsub();
  }, []);

  return isOnline;
}
