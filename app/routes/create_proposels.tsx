import NavLinks from "~/routes/components/navlinks";
import {ProposalData} from "~/routes/zodschema/.schema";
import { useState } from "react";
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent, usePublicClient } from "wagmi"; 
import counterAbi from "../../abi/Counter.json";
import incrementGovernerAbi from "../../abi/IncrementGoverner.json";
import { useEffect } from "react";
import { encodeFunctionData } from "viem";
 

export default function CreateProposels() {

  const publicClient = usePublicClient();

/* ////////////////////////////////proposel wagmi data and logics/////////////// */
const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const contractAddress = import.meta.env.VITE_COUNTER_ADDRESS as `0x${string}`;
  const governorAddress = import.meta.env.VITE_GOVERNOR_ADDRESS as `0x${string}`;
  
  const [incrementValueEnable, setIncrementValueEnable] = useState(true);
  const [mintTokenValueEnable, setMintTokenValueEnable] = useState(false);
  const [burnTokenValueEnable, setBurnTokenValueEnable] = useState(false);
  const [transferTokenValueEnable, setTransferTokenValueEnable] = useState(false);
 
  const { writeContract, isPending} = useWriteContract();
  const { isLoading: txPending, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
   // onSuccess() {
    //  refetch(); // 🔥 UI auto-update
   // },
  });



/* ////////////////////////////////proposel wagmi data and logics/////////////// */


  const [error, setError] = useState("");
  const [previewData, setPreviewData] = useState<z.infer<typeof ProposalData>>();
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const formData = new FormData(e.target as HTMLFormElement);
  const data = Object.fromEntries(formData.entries());
 
   if(e.nativeEvent.submitter.value=='preview_proposal_btn'){
      const result = ProposalData.safeParse(data);
      if(!result.success){
        setError(result.error.errors[0].message);
        console.log(result.error);
      }else{
        setError(""); 
       const preview = Object.entries(result.data); 
       setPreviewData(preview); 
      }

   }
   if(e.nativeEvent.submitter.value=='create_proposal_btn'){
    const result = ProposalData.safeParse(data);
      if(!result.success){
        setError(result.error.errors[0].message);
        console.log(result.error);
      }else{
        setError(""); 
        setPreviewData('');
        console.log(result.data, "result_data");
        
        const calldata = encodeFunctionData({
          abi: counterAbi,
          functionName: "increment",
          args: [result.data.increment_value]
          });
          const targets = [contractAddress] 
          const values = [0n] 
          const calldatas = [calldata]
          const description = result.data.prposal_description
          const incrementValue = result.data.increment_value;
          
          console.log("Sending Proposal Data:", { targets, values, calldatas, description, incrementValue });

          const proposalTxHashCreate =  await writeContract({
            address: governorAddress,
            abi: incrementGovernerAbi,
            functionName: "propose",
            args: [
              targets,
              values,
              calldatas,
              result.data.prposal_description
            ],
            gas: 5000000n 
          }, {
            onSuccess: (hash) => {
              setTxHash(hash);
            }
          })

          console.log(proposalTxHashCreate, "txHash");
      }

   }



/*   const result = ProposalData.safeParse(data);
  if (!result.success) {
    setError(result.error.errors[0].message);
    console.log(result.error);
  } else {
    setError("");
    result.data;     
    console.log(result.data); */
      
//  /* /////////////////////////////////write contract //////////////////// */
/* const incrementBy = Number(result.data.counter_limit);
const timeLimit = Number(result.data.time_limit);
      writeContract(
        {
          address: contractAddress,
          abi: counterAbi,
          functionName: "createProposal",
          args: [incrementBy, timeLimit], 
        },
        {
          onSuccess(hash) {
            setTxHash(hash);
          },
        }
      ); */

   /*    const { data: count, isLoading, refetch } = useReadContract({
        address: contractAddress,
        abi: counterAbi,
        functionName: "proposals", 
        args: [incrementBy, timeLimit], 
        query: {
          refetchInterval: 2000,  
          refetchOnWindowFocus: true,
        },
      }); */


  /* /////////////////////////////////end write contract////////////////////// */ 

  }


const proposalTypeSelection = (e: React.FormEvent<HTMLSelectElement>) => {
  const proposalType = e.target.value;
  if(proposalType=='increment_value'){
  setIncrementValueEnable(true);
}else{
  setIncrementValueEnable(false);
} 
 if(proposalType=='mint_token'){
  setMintTokenValueEnable(true);
}else{
  setMintTokenValueEnable(false);
} 
 if(proposalType=='burn_token'){
  setBurnTokenValueEnable(true);
}else{
  setBurnTokenValueEnable(false);
} 
if(proposalType=='transfer_token'){
  setTransferTokenValueEnable(true);
}else{
  setTransferTokenValueEnable(false);
} 
}
 


 
  return (
    <div>
      <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mt-4 mb-4">Create Proposels</h1>
      <NavLinks />
      <div className="flex flex-col items-center justify-center mt-4">
      {previewData && previewData.map(([key, value]) => {

const heading = key.replace(/_/g, " ")

return (
  <div key={key} className="  ">
    <span className="font-bold text-green-900 dark:text-gray-100">
      {heading}:
    </span>{" "}
    {value}
    <br />
  </div>
)

})}
</div>



      {error && <div  className="flex flex-col items-center justify-center mt-4" style={{ color: "red" }}>{error}</div>}
      {txPending?"Processing...":
           <div  className="flex flex-col items-center justify-center mt-4"> 
                   {txPending ? "Processing..." : ""}    
                  {isSuccess ? "Proposel Genereated Successfully" : "" } 
              </div>
              }

       <form /* action="/create_proposels" method="post" */ onSubmit={handleSubmit}>   
       <div className=" w-full space-y-2 px-4 flex flex-col items-center justify-center mt-5"> 
            <div className="flex">
            <h5 className="w-[250px] text-md text-red-950">Proposal Type</h5>
             <select name="proposal_type" id="" className="w-[300px] px-4 py-2 mx-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50" onChange={proposalTypeSelection}>
              <option value="increment_value">Increment Value </option>
              <option value="mint_token">Mint Token</option>
              <option value="burn_token">Burn Token</option>
              <option value="transfer_token">Transfer Token</option>
             </select>
            </div>
            <div className="flex flex-col items-center justify-center">
            
            </div>
            <div className="flex"> 
            <h5 className="w-[250px] text-md text-red-950">Proposal Description.</h5>
            <input type="text" className="w-[300px] px-4 py-2 mx-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50" placeholder="Proposal Description" required  name="prposal_description"/> 
            </div> 
 


            {incrementValueEnable && 
            <div className="flex"> 
            <h5 className="w-[250px] text-md text-red-950">Increment Value</h5>
            <input type="text" className="w-[300px] px-4 py-2 mx-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50" placeholder="Increment Value" required  name="increment_value"/> 
            </div> 
            }
            {mintTokenValueEnable && 
              <>
              <div className="flex"> 
              <h5 className="w-[250px] text-md text-red-950">Mint Token Value</h5>
              <input type="text" className="w-[300px] px-4 py-2 mx-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50" placeholder="Mint Token Value" required  name="mint_token_value"/> 
              </div> 
              <div className="flex"> 
              <h5 className="w-[250px] text-md text-red-950">Mint Receiver Address</h5>
              <input type="text" className="w-[300px] px-4 py-2 mx-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50" placeholder="Mint Receiver Address" required  name="mint_receiver_address"/> 
              </div> 
              </>
              
              }
              {burnTokenValueEnable && 
              <div className="flex"> 
              <h5 className="w-[250px] text-md text-red-950">Burn Token Value</h5>
              <input type="text" className="w-[300px] px-4 py-2 mx-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50" placeholder="Burn Token Value" required  name="burn_token_value"/> 
              </div> 
              }
              {transferTokenValueEnable && 
              <>
              <div className="flex"> 
              <h5 className="w-[250px] text-md text-red-950">Transfer Token Value</h5>
              <input type="text" className="w-[300px] px-4 py-2 mx-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50" placeholder="Transfer Token Value" required  name="transfer_token_value"/> 
              </div> 
              <div className="flex"> 
              <h5 className="w-[250px] text-md text-red-950">Transfer Receiver Address</h5>
              <input type="text" className="w-[300px] px-4 py-2 mx-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50" placeholder="Transfer Receiver Address" required  name="transfer_receiver_address"/> 
              </div> 
              </>
              }



            <div className="flex justify-center items-center mt-4"> 
            <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 mr-2" type="submit"  value="preview_proposal_btn">   Preview Proposal   </button> 

            <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50" type="submit" value="create_proposal_btn">  
            {txPending ? "Processing..." : "Create Proposal "}

            </button>
            </div>

        </div>
        </form>

    </div>
  );
}