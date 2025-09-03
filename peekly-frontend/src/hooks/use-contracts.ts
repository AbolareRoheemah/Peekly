import { ABI } from "@/app/abi";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useCallback, useEffect } from "react";
import { simulateContract } from '@wagmi/core';
import { config } from "@/wagmi";

// Optionally, you can use a toast library for notifications
import { toast } from "sonner";

// Helper to parse contract errors (implement as needed)
function parseContractError(error: any): string {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  return JSON.stringify(error);
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
  });
}

// --- Write Hooks ---

export function usePayETH() {
  const { data: writeData, writeContract, error: writeError, isPending: isPayETHLoading } = useWriteContract();
  const { isSuccess: isPayETHSuccess, error: confirmError } = useWaitForTransactionReceipt({ hash: writeData });

  const payETH = useCallback(async (creator: string, contentID: string, value: bigint) => {
    try {
      await simulateContract(config, {
        abi: ABI,
        address: contractAddress,
        functionName: "payETH",
        args: [creator, contentID],
        value,
      });
      writeContract({
        abi: ABI,
        address: contractAddress,
        functionName: "payETH",
        args: [creator, contentID],
        value,
      });
    } catch (error) {
      toast.error(parseContractError(error));
    }
  }, [writeContract]);

  useEffect(() => {
    if (isPayETHSuccess) {
      toast.success("Payment successful!");
    }
    if (writeError || confirmError) {
      toast.error(parseContractError(writeError || confirmError));
    }
  }, [writeError, confirmError, isPayETHSuccess]);

  return {
    payETH,
    isPayETHLoading,
    isPayETHSuccess,
    error: writeError || confirmError,
    hash: writeData,
  };
}

export function usePayToken() {
  const { data: writeData, writeContract, error: writeError, isPending: isPayTokenLoading } = useWriteContract();
  const { isSuccess: isPayTokenSuccess, error: confirmError } = useWaitForTransactionReceipt({ hash: writeData });

  const payToken = useCallback(async (creator: string, contentID: string, amount: bigint, tokenAddress: string) => {
    try {
      await simulateContract(config, {
        abi: ABI,
        address: contractAddress,
        functionName: "payToken",
        args: [creator, contentID, amount, tokenAddress],
      });
      writeContract({
        abi: ABI,
        address: contractAddress,
        functionName: "payToken",
        args: [creator, contentID, amount, tokenAddress],
      });
    } catch (error) {
      toast.error(parseContractError(error));
    }
  }, [writeContract]);

  useEffect(() => {
    if (isPayTokenSuccess) {
      toast.success("Token payment successful!");
    }
    if (writeError || confirmError) {
      toast.error(parseContractError(writeError || confirmError));
    }
  }, [writeError, confirmError, isPayTokenSuccess]);

  return {
    payToken,
    isPayTokenLoading,
    isPayTokenSuccess,
    error: writeError || confirmError,
    hash: writeData,
  };
}

export function useSetPlatformFee() {
  const { data: writeData, writeContract, error: writeError, isPending: isSetFeeLoading } = useWriteContract();
  const { isSuccess: isSetFeeSuccess, error: confirmError } = useWaitForTransactionReceipt({ hash: writeData });

  const setPlatformFee = useCallback(async (newFee: bigint) => {
    try {
      await simulateContract(config, {
        abi: ABI,
        address: contractAddress,
        functionName: "setPlatformFee",
        args: [newFee],
      });
      writeContract({
        abi: ABI,
        address: contractAddress,
        functionName: "setPlatformFee",
        args: [newFee],
      });
    } catch (error) {
      toast.error(parseContractError(error));
    }
  }, [writeContract]);

  useEffect(() => {
    if (isSetFeeSuccess) {
      toast.success("Platform fee updated!");
    }
    if (writeError || confirmError) {
      toast.error(parseContractError(writeError || confirmError));
    }
  }, [writeError, confirmError, isSetFeeSuccess]);

  return {
    setPlatformFee,
    isSetFeeLoading,
    isSetFeeSuccess,
    error: writeError || confirmError,
    hash: writeData,
  };
}

export function useSetFeeRecipient() {
  const { data: writeData, writeContract, error: writeError, isPending: isSetRecipientLoading } = useWriteContract();
  const { isSuccess: isSetRecipientSuccess, error: confirmError } = useWaitForTransactionReceipt({ hash: writeData });

  const setFeeRecipient = useCallback(async (newRecipient: string) => {
    try {
      await simulateContract(config, {
        abi: ABI,
        address: contractAddress,
        functionName: "setFeeRecipient",
        args: [newRecipient],
      });
      writeContract({
        abi: ABI,
        address: contractAddress,
        functionName: "setFeeRecipient",
        args: [newRecipient],
      });
    } catch (error) {
      toast.error(parseContractError(error));
    }
  }, [writeContract]);

  useEffect(() => {
    if (isSetRecipientSuccess) {
      toast.success("Fee recipient updated!");
    }
    if (writeError || confirmError) {
      toast.error(parseContractError(writeError || confirmError));
    }
  }, [writeError, confirmError, isSetRecipientSuccess]);

  return {
    setFeeRecipient,
    isSetRecipientLoading,
    isSetRecipientSuccess,
    error: writeError || confirmError,
    hash: writeData,
  };
}

export function useWithdrawETH() {
  const { data: writeData, writeContract, error: writeError, isPending: isWithdrawETHLoading } = useWriteContract();
  const { isSuccess: isWithdrawETHSuccess, error: confirmError } = useWaitForTransactionReceipt({ hash: writeData });

  const withdrawETH = useCallback(async (to: string, amount: bigint) => {
    try {
      await simulateContract(config, {
        abi: ABI,
        address: contractAddress,
        functionName: "withdrawETH",
        args: [to, amount],
      });
      writeContract({
        abi: ABI,
        address: contractAddress,
        functionName: "withdrawETH",
        args: [to, amount],
      });
    } catch (error) {
      toast.error(parseContractError(error));
    }
  }, [writeContract]);

  useEffect(() => {
    if (isWithdrawETHSuccess) {
      toast.success("ETH withdrawn!");
    }
    if (writeError || confirmError) {
      toast.error(parseContractError(writeError || confirmError));
    }
  }, [writeError, confirmError, isWithdrawETHSuccess]);

  return {
    withdrawETH,
    isWithdrawETHLoading,
    isWithdrawETHSuccess,
    error: writeError || confirmError,
    hash: writeData,
  };
}

export function useWithdrawToken() {
  const { data: writeData, writeContract, error: writeError, isPending: isWithdrawTokenLoading } = useWriteContract();
  const { isSuccess: isWithdrawTokenSuccess, error: confirmError } = useWaitForTransactionReceipt({ hash: writeData });

  const withdrawToken = useCallback(async (tokenAddress: string, to: string, amount: bigint) => {
    try {
      await simulateContract(config, {
        abi: ABI,
        address: contractAddress,
        functionName: "withdrawToken",
        args: [tokenAddress, to, amount],
      });
      writeContract({
        abi: ABI,
        address: contractAddress,
        functionName: "withdrawToken",
        args: [tokenAddress, to, amount],
      });
    } catch (error) {
      toast.error(parseContractError(error));
    }
  }, [writeContract]);

  useEffect(() => {
    if (isWithdrawTokenSuccess) {
      toast.success("Token withdrawn!");
    }
    if (writeError || confirmError) {
      toast.error(parseContractError(writeError || confirmError));
    }
  }, [writeError, confirmError, isWithdrawTokenSuccess]);

  return {
    withdrawToken,
    isWithdrawTokenLoading,
    isWithdrawTokenSuccess,
    error: writeError || confirmError,
    hash: writeData,
  };
}