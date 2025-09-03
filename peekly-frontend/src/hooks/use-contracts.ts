import { ABI } from "@/app/abi";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { useCallback, useEffect, useRef } from "react";
import { simulateContract, writeContract } from '@wagmi/core';
import { config } from "@/wagmi";
import { usePrivy } from '@privy-io/react-auth';
import { toast } from "sonner";

// Helper to parse contract errors
function parseContractError(error: any): string {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.cause?.message) return error.cause.message;
  if (error.reason) return error.reason;
  return JSON.stringify(error);
}

// Helper to extract the first sentence from an error string
function firstSentence(str: string): string {
  if (!str) return "";
  const idx = str.indexOf(".");
  if (idx === -1) return str;
  return str.slice(0, idx + 1);
}

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

// --- Read Hooks ---
export function usePlatformFeePercent() {
  return useReadContract({
    abi: ABI,
    address: contractAddress,
    functionName: "platformFeePercent",
  });
}

export function useFeeRecipient() {
  return useReadContract({
    abi: ABI,
    address: contractAddress,
    functionName: "feeRecipient",
  });
}

export function useOwner() {
  return useReadContract({
    abi: ABI,
    address: contractAddress,
    functionName: "owner",
  });
}

export function useHasPaid(account: string, contentID: string) {
  return useReadContract({
    abi: ABI,
    address: contractAddress,
    functionName: "hasPaid",
    args: [account, contentID],
    // enabled: !!account && !!contentID,
  });
}

// --- Write Hooks ---
export function usePayETH() {
  const { address } = useAccount();
  const { authenticated } = usePrivy();
  const { data: writeData, writeContract, error: writeError, isPending: isPayETHLoading } = useWriteContract();
  const { isSuccess: isPayETHSuccess, error: confirmError } = useWaitForTransactionReceipt({ 
    hash: writeData,
  });

  // Store simulation error in a ref so it can be shown by toast
  const simulationErrorRef = useRef<any>(null);

  const payETH = useCallback(async (creator: string, contentID: string, value: bigint) => {
    simulationErrorRef.current = null;
    console.log('payETH called:', { creator, contentID, value: value.toString(), address, authenticated });
    
    if (!address) {
      const err = new Error('Wallet not connected');
      simulationErrorRef.current = err;
      toast.error(firstSentence(parseContractError(err)));
      throw err;
    }
    
    if (!authenticated) {
      const err = new Error('User not authenticated');
      simulationErrorRef.current = err;
      toast.error(firstSentence(parseContractError(err)));
      throw err;
    }

    try {
      // First simulate the contract call
      console.log('Simulating contract...');
      const { request } = await simulateContract(config, {
        abi: ABI,
        address: contractAddress,
        functionName: "payETH",
        args: [creator, contentID],
        value,
        account: address,
      });
      
      console.log('Simulation successful, writing contract...');
      
      // Then execute the actual transaction
      const hash = await writeContract({
        abi: ABI,
        address: contractAddress,
        functionName: "payETH",
        args: [creator, contentID],
        value,
      });
      
      console.log('Transaction submitted:', hash);
      
    } catch (error) {
      console.error('payETH error:', error);
      simulationErrorRef.current = error;
      toast.error(firstSentence(parseContractError(error)));
      throw new Error(parseContractError(error));
    }
  }, [address, authenticated, writeContract]);

  useEffect(() => {
    // Show simulation error toast if present and not already shown
    if (simulationErrorRef.current) {
      // Already shown in payETH, so do nothing here
      simulationErrorRef.current = null;
    }
    if (isPayETHSuccess) {
      toast.success("Payment successful!");
      console.log('ETH payment successful:', writeData);
    }
    if (writeError) {
      console.error('Write error:', writeError);
      toast.error(firstSentence(parseContractError(writeError)));
    }
    if (confirmError) {
      console.error('Confirmation error:', confirmError);
      toast.error(firstSentence(parseContractError(confirmError)));
    }
  }, [writeError, confirmError, isPayETHSuccess, writeData]);

  return {
    payETH,
    isPayETHLoading,
    isPayETHSuccess,
    error: writeError || confirmError,
    hash: writeData,
  };
}

export function usePayToken() {
  const { address } = useAccount();
  const { authenticated } = usePrivy();
  const { data: writeData, writeContract, error: writeError, isPending: isPayTokenLoading } = useWriteContract();
  const { isSuccess: isPayTokenSuccess, error: confirmError } = useWaitForTransactionReceipt({ 
    hash: writeData,
  });

  // Store simulation error in a ref so it can be shown by toast
  const simulationErrorRef = useRef<any>(null);

  const payToken = useCallback(async (creator: string, contentID: string, amount: bigint, tokenAddress: string) => {
    simulationErrorRef.current = null;
    console.log('payToken called:', { creator, contentID, amount: amount.toString(), tokenAddress, address, authenticated });
    
    if (!address) {
      const err = new Error('Wallet not connected');
      simulationErrorRef.current = err;
      toast.error(firstSentence(parseContractError(err)));
      throw err;
    }
    
    if (!authenticated) {
      const err = new Error('User not authenticated');
      simulationErrorRef.current = err;
      toast.error(firstSentence(parseContractError(err)));
      throw err;
    }

    try {
      // First simulate the contract call
      console.log('Simulating token contract...');
      const { request } = await simulateContract(config, {
        abi: ABI,
        address: contractAddress,
        functionName: "payToken",
        args: [creator, contentID, amount, tokenAddress],
        account: address,
      });
      
      console.log('Token simulation successful, writing contract...');
      
      // Then execute the actual transaction
      const hash = await writeContract({
        abi: ABI,
        address: contractAddress,
        functionName: "payToken",
        args: [creator, contentID, amount, tokenAddress],
      });
      
      console.log('Token transaction submitted:', hash);
      
    } catch (error) {
      console.error('payToken error:', error);
      simulationErrorRef.current = error;
      toast.error(firstSentence(parseContractError(error)));
      throw new Error(parseContractError(error));
    }
  }, [address, authenticated, writeContract]);

  useEffect(() => {
    // Show simulation error toast if present and not already shown
    if (simulationErrorRef.current) {
      // Already shown in payToken, so do nothing here
      simulationErrorRef.current = null;
    }
    if (isPayTokenSuccess) {
      toast.success("Token payment successful!");
      console.log('Token payment successful:', writeData);
    }
    if (writeError) {
      console.error('Token write error:', writeError);
      toast.error(firstSentence(parseContractError(writeError)));
    }
    if (confirmError) {
      console.error('Token confirmation error:', confirmError);
      toast.error(firstSentence(parseContractError(confirmError)));
    }
  }, [writeError, confirmError, isPayTokenSuccess, writeData]);

  return {
    payToken,
    isPayTokenLoading,
    isPayTokenSuccess,
    error: writeError || confirmError,
    hash: writeData,
  };
}

// ... (other hooks remain the same but with similar error handling improvements)