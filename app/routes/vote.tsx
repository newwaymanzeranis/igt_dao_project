import NavLinks from "./components/navlinks";
import { useParams } from "react-router";
import { use, useState } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent, usePublicClient, useEstimateGas, useAccount, useWalletClient } from "wagmi"; 
import counterAbi from "../../abi/Counter.json";
import governorAbi from "../../abi/IncrementGoverner.json";
import { useEffect } from "react";
import { BaseError, ContractFunctionRevertedError } from "viem";


export default function Vote() {
    const { id } = useParams();
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
    const contractAddress = import.meta.env.VITE_COUNTER_ADDRESS as `0x${string}`;
    const governorAddress = import.meta.env.VITE_GOVERNOR_ADDRESS as `0x${string}`;


    const { writeContract, isPending } = useWriteContract();
    const { address } = useAccount(); 
    const publicClient = usePublicClient();
    const [solidityError, setSolidityError] = useState<string | undefined>();
    const { isLoading: txPending, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    onSuccess() {
    refetch(); // 🔥 UI auto-update
    },
  });

  const walletClient = useWalletClient();

  const { data: listedtContract } = useReadContract({
    address: contractAddress,
    abi: counterAbi,
    functionName: "proposals",
    args: [id],
  });

     const { data: votestate } = useReadContract({
      address: governorAddress,
      abi: governorAbi,
      functionName: "state",
      args: [BigInt(id)],
    });

   console.log(votestate, "votestate");

    
    const truevotes = async (id: string) => { 
        if(!window.confirm("Are you sure you want to vote True?")){
            return false;
        }
        try { 
 
        /*   const votestate =  await readContract({
            address: governorAddress,
            abi: governorAbi,
            functionName: "state",
            args: [BigInt(id)],
          });
          
          console.log("Proposal State:", votestate); */
          // 0 = Pending (Wait karein), 1 = Active (Ab vote karein), 2 = Canceled...

 
        const hash = await writeContract({
          address: governorAddress,
          abi: governorAbi,
          functionName: "castVote",
          args: [BigInt(id), 1],
        });
    
        console.log("Vote tx:", hash);


       }  catch (err) {
        console.log("Error:", err);
        if (err instanceof BaseError) {
          const revertError = err.walk(
            (e) => e instanceof ContractFunctionRevertedError
          );
      
          if (revertError) {
            console.log("Revert reason:", revertError.reason);
            setSolidityError(revertError.reason);
          } else {
            console.log("Error:", err.shortMessage);
          }
        }
        
    }
}
    const falsevotes = async (id: string) => { 
        if(!window.confirm("Are you sure you want to vote False?")){
            return false; 
        }
        try {
        const support = false;
await publicClient?.simulateContract({
    address: contractAddress,
    abi: counterAbi,
    functionName: "increment",
    args: [BigInt(id), support],
    account: address,
  });
 
  await writeContract({
            address: contractAddress,
            abi: counterAbi,
            functionName: "increment",
            args: [id, false],
            
        });
      }  catch (err) {
        console.log("Error:", err);
        if (err instanceof BaseError) {
          const revertError = err.walk(
            (e) => e instanceof ContractFunctionRevertedError
          );
      
          if (revertError) {
            console.log("Revert reason:", revertError.reason);
            setSolidityError(revertError.reason);
          } else {
            console.log("Error:", err.shortMessage);
          }
        }
    }
         


    }
useEffect(() => { 
    setTimeout(() => {
        setSolidityError('');
    }, 3000);

  }, [isSuccess, solidityError]);


      
   return(
        <>
       <div className="flex flex-col items-center gap-4 "> 
        <h1 className="text-4xl font-bold text-center text-gray-900  mt-4 mb-4">Vote for Proposal No. - <span className="text-red-600 ">{id?.slice(0, 6)}....</span></h1>
        <NavLinks /> 
       </div>
       <div className="flex items-center gap-4 justify-center mt-10"> 
        {solidityError && <h3 className="text-2xl font-bold text-center text-red-900  mt-4 mb-4">{solidityError}</h3>}
       {isSuccess  && <h3 className="text-2xl font-bold text-center text-green-900  mt-4 mb-4">
           Vote Submitted 
            </h3>} 
            {isPending && <p className="text-lg text-center text-green-900  mt-4 mb-4">Thank you for voting! Processing your vote...</p>}
        </div> 
       <div className="flex items-center gap-4 justify-center mt-10"> 
        {listedtContract &&  <span className="text-2xl font-bold text-center text-green-700  mt-4 mb-4">True Votes:  {(listedtContract[2].toString())} </span> }
       <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50 mr-3 cursor-pointer" onClick={() => truevotes(id)}>True</button>
       {listedtContract && <span className="text-2xl font-bold text-center text-red-700  mt-4 mb-4">False Votes:  {(listedtContract[3].toString())} </span> }
<button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 cursor-pointer" onClick={() => falsevotes(id)}>False</button>
</div>
       </>

   )
   


}