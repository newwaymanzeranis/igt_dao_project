import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from "wagmi";
import counterAbi from "../../abi/Counter.json";
import { useState } from "react";




export function Welcome() {

  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const contractAddress = import.meta.env.VITE_COUNTER_ADDRESS as `0x${string}`;

  const { data: count, isLoading, refetch } = useReadContract({
    address: contractAddress,
    abi: counterAbi,
    functionName: "x", 
    query: {
      refetchInterval: 2000, // 🔥 REAL FIX
      refetchOnWindowFocus: true,
    },
  });
  const { writeContract, isPending} = useWriteContract();
  const { isLoading: txPending } = useWaitForTransactionReceipt({
    hash: txHash,
   // onSuccess() {
    //  refetch(); // 🔥 UI auto-update
   // },
  });
 

  const handleIncrement = () => {
    writeContract(
      {
        address: contractAddress,
        abi: counterAbi,
        functionName: "inc",
      },
      {
        onSuccess(hash) {
          setTxHash(hash);
        },
      }
    );
  };
  
  
  console.log("ADDRESS:", contractAddress);

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <header className="flex flex-col items-center gap-9">
          <div className="w-[500px] max-w-[100vw] p-4">
             <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-gray-100">
               Hardhat Project
             </h1>
          </div>
        </header>
        <div className="max-w-[300px] w-full space-y-6 px-4">
           <h3>Hardhat Project</h3>
              <h2>
              Counter value: {isLoading ? "Loading..." : count?.toString()}
              </h2>

                  <button
                  disabled={isPending}
                  onClick={handleIncrement} className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 cursor-pointer"
                  >
                  {txPending ? "Processing..." : "Increment"}
                  </button>

        </div>
      </div>
    </main>
  );
}

