import NavLinks from "~/routes/components/navlinks";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {RainbowKitCustomConnectionButton} from "~/routes/components/customConnectionButton";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent, usePublicClient, useEstimateGas, useAccount } from "wagmi"; 
import counterAbi from "../../abi/Counter.json";
import incrementTokenAbi from "../../abi/IncrementToken.json";
import { useState, useEffect } from "react";
import { BaseError, ContractFunctionRevertedError, formatEther } from "viem";
import {DelegateToAnother} from '~/routes/zodschema/.schema';

export default function Dashboard() {
  const {
    data: hash,
    writeContract,
    isError: isDelegateWriteError,
    isPending: isDelegateWritePending,
    isSuccess: isDelegateWriteSuccess,
  } = useWriteContract();

    const [messageHidden, setMessageHidden] = useState<boolean>(true);

  const { isSuccess:isSuccessTransactionReceipt } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (isSuccessTransactionReceipt) {
      refetchVotes()
      refetchDelegation()
    }
    
    setTimeout(() => {
      setMessageHidden(false);
    }, 3000);


  }, [isSuccessTransactionReceipt, setMessageHidden ])

  
    const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
    const contractAddress = import.meta.env.VITE_TOKEN_ADDRESS as `0x${string}`;
    const   [isSelfDelegated, setIsSelfDelegated] = useState<string>('');
    
    const { address } = useAccount(); 
 
    const {data: getTokenBalance, error, isError } =  useReadContract({
      address: contractAddress,
      abi: incrementTokenAbi,
      functionName: "balanceOf",
      args: [address],
    });

    const { data: tokenName } = useReadContract({
      address: contractAddress,
      abi: incrementTokenAbi,
      functionName: "name",
    });

    const { data: delegatedTo, refetch: refetchDelegation } = useReadContract({
      address: contractAddress,
      abi: incrementTokenAbi,
      functionName: "delegates",
      args: [address],
    })
    const { data: votingPower, refetch: refetchVotes } = useReadContract({
      address: contractAddress,
      abi: incrementTokenAbi,
      functionName: "getVotes",
      args: [address],
    })

    const delegatedDisplay =
    delegatedTo?.toLowerCase() === address?.toLowerCase()
      ? "Self"
      : delegatedTo;

      const isZeroAddressConfirm =
      delegatedTo === "0x0000000000000000000000000000000000000000"
    
      const isSelfDelegatedConfirm =
      delegatedTo?.toLowerCase() === address?.toLowerCase()

      


    const readableBalance = getTokenBalance
    ? formatEther(getTokenBalance)
    : "0";

    const readableVotingPower = votingPower
    ? formatEther(votingPower)
    : "0";

    const shortName = tokenName&& tokenName
    .split(" ")
    .map(word => word[0])
    .join("");
  
  
   const setDelegateToAnother = (e: React.FormEvent<HTMLFormElement>) => {
         e.preventDefault();
         const formData = new FormData(e.target as HTMLFormElement);
         const data = {
          delegateTo: formData.get("delegateTo"),
        };
      console.log(data, "pppppp");
        const result = DelegateToAnother.safeParse(data);  
        if (!result.success) {
          console.log(result.error.format());
          alert(result.error.errors[0].message);
          return;
        }
        else if(data.delegateTo === address) {
          alert("Already self delegated plz try another address");
        }
        else{
           
          console.log("Token contract:", contractAddress)
          console.log("Delegated To:", data.delegatedTo)
          console.log("Wallet:", address)

          writeContract({
            address: contractAddress,
            abi: incrementTokenAbi,
            functionName: "delegate",
            args: [data.delegateTo],
          });

        }
   }


const reclameVoting = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
     console.log(address, "address");  
    writeContract({
    address: contractAddress,
    abi: incrementTokenAbi,
    functionName: "delegate",
    args: [address],
  });

}



 

  return (
    <div>
      <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mt-4 mb-4">Dashboard </h1> 
      <div className="flex justify-center items-center mb-4">
        <RainbowKitCustomConnectionButton />
      </div>
      <NavLinks />

      <div className="flex justify-between items-center mb-4 w-1/2 mx-auto mt-3">
      <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">  Token  Balance - <span className="text-blue-500">{readableBalance} {shortName}</span> </h4>
      <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">  Voting Power - <span className="text-blue-500">{readableVotingPower}</span> </h4>
      
      {/* {readableBalance && readableVotingPower === "0" && readableBalance !== "0" &&
       <button className="bg-linear-to-r from-purple-500 via-indigo-500 to-blue-500 text-white px-4 py-2 rounded-md cursor-pointer">Activate Voting</button>
      } */}
      {readableBalance !== "0" && isZeroAddressConfirm && (
      <button className="bg-linear-to-r from-purple-500 via-indigo-500 to-blue-500 text-white px-4 py-2 rounded-md cursor-pointer" onClick={reclameVoting}>Activate Voting</button>
      )}
      {readableBalance !== "0" && !isZeroAddressConfirm && !isSelfDelegatedConfirm && (
      <button className="bg-linear-to-r from-purple-500 via-indigo-500 to-blue-500 text-white px-4 py-2 rounded-md cursor-pointer" onClick={reclameVoting}>Reclaim Voting</button>
      )}
   
       
      
      
      </div>

      <div className="flex justify-center items-center ">
      {delegatedDisplay && <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">  Delegated To - <span className="text-blue-500">{delegatedDisplay}</span> </h4>}

      </div>


      <div className="flex justify-center items-center mt-4"> 
       {!messageHidden && isDelegateWriteError &&  <h4 className="text-xl font-bold text-red-500 dark:text-red-100">  Error - <span className="text-red-500">{isDelegateWriteError.message}</span> </h4>}

       {!messageHidden && isDelegateWriteSuccess && <h4 className="text-xl font-bold text-green-500 dark:text-green-100">  Success - <span className="text-green-500">Delegation Successful</span> </h4>}

       {!messageHidden && isDelegateWritePending && <h4 className="text-xl font-bold text-yellow-500 dark:text-yellow-100">  Pending - <span className="text-yellow-500">Delegation Progress</span> </h4>}
       </div>  


        {readableVotingPower !== "0" && isSelfDelegatedConfirm && ( 
      <form  onSubmit={setDelegateToAnother} > 
      <div className="flex  w-1/2 mx-auto mt-4">
      {readableBalance && readableVotingPower > "0" && readableBalance !== "0" &&
      <div>
       <button className="bg-linear-to-r from-purple-500 via-indigo-500 to-blue-500 text-white px-4 py-2 rounded-md cursor-pointer" >Activate Voting Power TO Another</button>
       <input type="text" name="delegateTo" id=""  className="px-4 py-2 rounded-md border border-gray-300  flex-1 w-md ml-2" />
       </div>
      }         
        
        </div> 
        </form> 
        )}



    </div>
  );
}