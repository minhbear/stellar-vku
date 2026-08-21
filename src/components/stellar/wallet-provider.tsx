"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  WatchWalletChanges,
  getAddress,
  getNetwork,
  isConnected,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";

import { stellarConfig } from "@/lib/stellar/config";
import type { AccountSummary } from "@/lib/stellar/client";

export type WalletStatus = "checking" | "notInstalled" | "disconnected" | "connected";

export interface WalletState {
  status: WalletStatus;
  address: string | null;
  /** Network name Freighter reports, e.g. `TESTNET`. */
  network: string | null;
  networkPassphrase: string | null;
  /** True when the wallet is on a different network than the app targets. */
  networkMismatch: boolean;
  account: AccountSummary | null;
  accountLoading: boolean;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshAccount: () => Promise<void>;
  fundAccount: () => Promise<void>;
  sign: (xdr: string) => Promise<string>;
}

const WalletContext = createContext<WalletState | null>(null);

export function useWallet(): WalletState {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used inside <WalletProvider>");
  return context;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<WalletStatus>("checking");
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [networkPassphrase, setNetworkPassphrase] = useState<string | null>(null);
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [accountLoading, setAccountLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guards against a stale account fetch overwriting a newer one after the
  // student switches accounts inside Freighter.
  const requestIdRef = useRef(0);

  const loadAccount = useCallback(async (target: string | null) => {
    if (!target) {
      setAccount(null);
      return;
    }
    const requestId = ++requestIdRef.current;
    setAccountLoading(true);
    try {
      const { getAccountSummary } = await import("@/lib/stellar/client");
      const summary = await getAccountSummary(target);
      if (requestId === requestIdRef.current) setAccount(summary);
    } catch {
      if (requestId === requestIdRef.current) setAccount(null);
    } finally {
      if (requestId === requestIdRef.current) setAccountLoading(false);
    }
  }, []);

  // Restore a previously granted connection without prompting the user.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const installed = await isConnected();
      if (cancelled) return;
      if (installed.error || !installed.isConnected) {
        setStatus("notInstalled");
        return;
      }

      // `getAddress` returns "" until the site has been granted access, so a
      // non-empty value means we are already authorised.
      const granted = await getAddress();
      if (cancelled) return;
      if (granted.error || !granted.address) {
        setStatus("disconnected");
        return;
      }

      const net = await getNetwork();
      if (cancelled) return;
      setAddress(granted.address);
      setNetwork(net.network ?? null);
      setNetworkPassphrase(net.networkPassphrase ?? null);
      setStatus("connected");
      void loadAccount(granted.address);
    })();

    return () => {
      cancelled = true;
    };
  }, [loadAccount]);

  // Freighter has no event bus for account/network switches, so poll while connected.
  useEffect(() => {
    if (status !== "connected") return;

    const watcher = new WatchWalletChanges(2000);
    watcher.watch(({ address: nextAddress, network: nextNetwork, networkPassphrase: nextPassphrase }) => {
      setAddress((current) => {
        if (nextAddress && nextAddress !== current) void loadAccount(nextAddress);
        return nextAddress || current;
      });
      if (nextNetwork) setNetwork(nextNetwork);
      if (nextPassphrase) setNetworkPassphrase(nextPassphrase);
    });

    return () => watcher.stop();
  }, [status, loadAccount]);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const installed = await isConnected();
      if (installed.error || !installed.isConnected) {
        setStatus("notInstalled");
        return;
      }

      const granted = await requestAccess();
      if (granted.error) throw new Error(granted.error.message);

      const net = await getNetwork();
      if (net.error) throw new Error(net.error.message);

      setAddress(granted.address);
      setNetwork(net.network ?? null);
      setNetworkPassphrase(net.networkPassphrase ?? null);
      setStatus("connected");
      await loadAccount(granted.address);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setConnecting(false);
    }
  }, [loadAccount]);

  const disconnect = useCallback(() => {
    // Freighter grants access per-origin from the extension itself; the app can
    // only forget the session locally.
    setAddress(null);
    setAccount(null);
    setNetwork(null);
    setNetworkPassphrase(null);
    setStatus("disconnected");
  }, []);

  const refreshAccount = useCallback(async () => {
    await loadAccount(address);
  }, [address, loadAccount]);

  const fundAccount = useCallback(async () => {
    if (!address) return;
    const { fundWithFriendbot } = await import("@/lib/stellar/client");
    await fundWithFriendbot(address);
    await loadAccount(address);
  }, [address, loadAccount]);

  const sign = useCallback(
    async (xdr: string) => {
      if (!address) throw new Error("Wallet not connected");
      const result = await signTransaction(xdr, {
        networkPassphrase: stellarConfig.networkPassphrase,
        address,
      });
      if (result.error) throw new Error(result.error.message);
      return result.signedTxXdr;
    },
    [address],
  );

  const value = useMemo<WalletState>(
    () => ({
      status,
      address,
      network,
      networkPassphrase,
      networkMismatch:
        status === "connected" &&
        networkPassphrase !== null &&
        networkPassphrase !== stellarConfig.networkPassphrase,
      account,
      accountLoading,
      connecting,
      error,
      connect,
      disconnect,
      refreshAccount,
      fundAccount,
      sign,
    }),
    [
      status,
      address,
      network,
      networkPassphrase,
      account,
      accountLoading,
      connecting,
      error,
      connect,
      disconnect,
      refreshAccount,
      fundAccount,
      sign,
    ],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
