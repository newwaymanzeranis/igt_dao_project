
import { useParams } from "react-router";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent, usePublicClient, useEstimateGas, useAccount } from "wagmi"; 
import counterAbi from "../../abi/Counter.json";
import { useEffect, useState } from "react";
import NavLinks from "./components/navlinks";
import { BaseError, ContractFunctionRevertedError } from "viem";
import { constants } from "buffer";


export default function Proposel() {
    const { id } = useParams();
      const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
      const contractAddress = import.meta.env.VITE_COUNTER_ADDRESS as `0x${string}`;
      const [solidityError, setSolidityError] = useState<string | undefined>();

     const [isExecuteSuccess, setIsExecuteSuccess] = useState<string | undefined>();

     const { writeContract , isPending:isExePending, isSuccess: isExeSuccess } = useWriteContract();
     

    const { data: listedtContract } = useReadContract({
    address: contractAddress,
    abi: counterAbi,
    functionName: "proposals",
    args: [id],
  });

  const { address } = useAccount(); 
  const publicClient = usePublicClient();

  const { isLoading: txPending, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
    onSuccess() {
    refetch(); // 🔥 UI auto-update
    },
  });

 console.log("listedtContracttt:", listedtContract /* , listedtContract[0].toString() */ );

 const endTime =  Math.floor(Number(listedtContract&&(listedtContract[4].toString())));
 const now = Math.floor(Date.now() / 1000);
 
 const remainingSeconds = now - endTime;

 console.log(endTime, now, remainingSeconds, "adjlfkadj flkj adlfkj dafl");

 const hours = Math.floor(remainingSeconds / 3600) ;
 const minutes = Math.floor((remainingSeconds % 3600) / 60);
 const seconds = Math.floor(remainingSeconds % 60);

 
 const endTimestamp = listedtContract&&(listedtContract[4].toString());
 const isExpired = endTimestamp <= now;
  


  const executeProposel = async (id: string) => {
   
    if(!window.confirm("Are you sure you want to execute this proposel?")){
      return;
    }
    
    try {   
       
      await publicClient?.simulateContract({
          address: contractAddress,
          abi: counterAbi,
          functionName: "execute",
          args: [BigInt(id)],
          account: address,
        });

      await writeContract({
        address: contractAddress,
        abi: counterAbi,
        functionName: "execute",
        args: [id],
      })
    
  } catch (err) {

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
};

isSuccess && setIsExecuteSuccess(isSuccess);

useEffect(() => {
setTimeout(() => {
  setIsExecuteSuccess('');
  setSolidityError('');
}, 3000);



}, [isExecuteSuccess, solidityError]);



    
  return (
    <div>
      <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mt-4 mb-4">Proposel</h1>
      <NavLinks />
      

        <div className="flex flex-col items-center gap-3 mt-4">

        <h2><b>Proposel ID:</b> {id}</h2>
        <h2><b>Proposel incrementBy:</b> {listedtContract&&(listedtContract[1].toString())}</h2>
        <h2><b>Proposel votesFor:</b> {listedtContract&&(listedtContract[2].toString())}</h2>
         <h2><b>Proposel votesAgainst:</b> {listedtContract&&(listedtContract[3].toString())}</h2>
        <h2><b>Proposel endTime:</b>
        {new Date(Number(endTimestamp) * 1000).toLocaleString()} 
        </h2>
        <h2><b>Proposel executed:</b> {listedtContract&&(listedtContract[5].toString())}</h2> 
        <h2><b>Proposel Status:</b> {isExpired ? "Expired" :   'Active' } </h2>      
        </div>
         
         {solidityError&& <div className="text-red-500 font-bold text-center text-lg mt-4 mb-4">{solidityError}</div>}
         {isSuccess&& <div className="text-green-500 font-bold text-center text-lg mt-4 mb-4">Proposel executed successfully!</div>}

         <div className="flex flex-col items-center gap-3 mt-4"> 
         {isExpired && listedtContract&&(listedtContract[5].toString()) === 'false' ?    <button className="bg-red-500 text-white px-4 py-2 rounded-md cursor-pointer" onClick={() => executeProposel(id)}>Execute</button> :   'Executed' }  
         </div>



    </div> 
  );
}