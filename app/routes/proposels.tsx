import NavLinks from "~/routes/components/navlinks";
import { useState } from "react";
import { useReadContract, useReadContracts,  useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent, usePublicClient } from "wagmi"; 
import counterAbi from "../../abi/Counter.json";
import incrementGovernerAbi from "../../abi/IncrementGoverner.json";
import { useEffect } from "react";
import { Link } from "react-router";
import { parseAbiItem, formatUnits, keccak256, stringToBytes } from "viem";
import { gql } from '@apollo/client/core/index.js';
import { useQuery } from '@apollo/client/react/index.js';
import { useContext } from "react";

const GET_PROPOSALS = gql`
  query GetProposals {
    proposals(orderBy: blockTimestamp, orderDirection: desc) {
      id
      proposalId
      proposer
       targets
      values
      calldatas
      description 
      blockTimestamp
      votes { 
        id
        voter
        support
        weight
      }
    }
  }
`;




export default function Proposeles() {

  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const contractAddress = import.meta.env.VITE_COUNTER_ADDRESS as `0x${string}`;
  const governorAddress = import.meta.env.VITE_GOVERNOR_ADDRESS as `0x${string}`;
  const [proposalsLogDetails, setProposalsLogDetails] = useState<any[]>([]);
  const [findAllStates, setFindAllStates] = useState<any[]>([]);


  const publicClient = usePublicClient();
  
  const {writeContractAsync} = useWriteContract();
  const { refetch } = useReadContract({
    address: governorAddress,
    abi: incrementGovernerAbi,
    functionName: "proposalVotes",
  });
   
  const { data: x } = useReadContract({
    address: contractAddress,
    abi: counterAbi,
    functionName: "x",
  });

  /* ////////////////////////////////////the graph configure ///////// */
const { loading, error, data } = useQuery(GET_PROPOSALS, {
  pollInterval: 150000, // Har 5 second mein automatic naya data check karega
});



const proposals = data?.proposals || [];
 

/* ///////////////////////////////state value findes////////////////////////////////////// */
const { data: states, isError: stateError } = useReadContracts({
  contracts: proposals.map((p: any) => ({
    address: governorAddress,
    abi: incrementGovernerAbi,
    functionName: 'state',
    args: [BigInt(p.proposalId)],
  })),
});
 
/* ////////////////////////////////states added to proposals ////////////////////////////////////// */
if (loading) return <div className="p-10 text-center text-gray-400">Loading Proposals...</div>;
if (error) return <div className="p-10 text-center text-red-500">Error: {error.message}</div>;

 

const proposalsWithStates = proposals.map((proposal: any, index: number) => ({
  ...proposal,
  state: states?.[index]?.result // result mein 0, 1, 3 wagera milega
}));



/* //////////////////////////////////////////////////////////////////////// */

   
 /*  const contracts =
  proposalCount && proposalCount > 0
    ? Array.from({ length: Number(proposalCount) }, (_, i) => ({
        address: contractAddress,
        abi: counterAbi,
        functionName: "proposals",
        args: [i + 1],
      }))
    : [];

    const { data: proposals } = useReadContracts({
      contracts,
    }); */
//* ////////////////////////////////quing for proposals ////////////////////////////////////// */
const queueProposal =   async  (proposalId: bigint, targets: string[],  values: BigInt[], calldatas: string[], description: string) => {
 
  if(!window.confirm("Are you sure you want to queue this proposal?")){
    return false;
} 

/* console.log(proposalId, "proposalId", targets, "targets", values,"values", calldatas, "calldatas", description, "description"); */

const descriptionHash = keccak256(stringToBytes(description));
values = values.map((v) => BigInt(v));

console.log(targets, values, calldatas, descriptionHash, description, "queue");
try {
const queueTxHash = await writeContractAsync({
  address: governorAddress,
  abi: incrementGovernerAbi,
  functionName: "queue",
  args: [
    targets,     
    values,      
    calldatas,   
    descriptionHash,            
  ],
  gas: 1000000n,
    
});
}catch(err){
  console.error("Queue error:", err);
}

   // console.log(queueTxHash, "proposal details", proposalId);

  };
  /*   const { data: queueTxHash } = await writeContractAsync({
      address: governorAddress,
      abi: incrementGovernerAbi,
      functionName: "queueProposal",
      args: [proposalId],
    });
    setTxHash(queueTxHash); */

//* ////////////////////////////////quing for proposals ////////////////////////////////////// */

/*/ ////////////////////////////////execute proposals ////////////////////////////////////// */
const executeProposal = async ( proposalId: bigint, targets: string[],  values: BigInt[], calldatas: string[], description: string) =>{

  if(!window.confirm("Are you sure you want to execute this proposal?")){
    return false;
} 

const descriptionHash = keccak256(stringToBytes(description));
values = values.map((v) => BigInt(v));

console.log(targets, values, calldatas, descriptionHash, description, "execute");
try {
const queueTxHash = await writeContractAsync({
  address: governorAddress,
  abi: incrementGovernerAbi,
  functionName: "execute",
  args: [
    targets,     
    values,      
    calldatas,   
    descriptionHash,            
  ],
  gas: 1000000n,
    
});
}catch(err){
  console.error("Queue error:", err);
}

 

  
}


/*/ ////////////////////////////////execute proposals ////////////////////////////////////// */


   
 
//console.log(proposalsWithStates, "proposalsWithStates");

  return (
    <div>
      <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-gray-100 mt-4 mb-4">Proposels</h1>
      <NavLinks />
      
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-white border-b border-gray-700 pb-2">
        Active Proposals
      </h2>
      
      {proposalsWithStates.length === 0 ? (
        <p className="text-gray-500">No proposals found yet.</p>
      ) : (
        <div className="grid gap-4">
          {proposalsWithStates.map((item: any) => (

 
            <div 
              key={item.id} 
              className="bg-gray-200/50 border border-gray-700 p-5 rounded-xl hover:border-blue-500 transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-blue-400 bg-blue-900/30 px-2 py-1 rounded">
                  {item.daoName || "DAO Project"}
                </span>
                <span className="text-gray-500 text-xs">
                  ID: #{item.proposalId.toString()}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {item.description} 
              </h3>
              
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="font-medium text-gray-500 text-[10px]">PROPOSER:</span>
                <span className="truncate w-32 font-mono">{item.proposer}</span>
                <Link 
                to={`/vote/${item.proposalId}`} 
                style={{ color: 'blue', textDecoration: 'underline', fontWeight: 'bold' }}
                >
                View Details & Vote
                </Link>
                <span className="font-medium text-gray-500 text-[10px]">STATE:</span>
                <span className="truncate w-32 font-mono">
                  {item.state==0 ? "Pending" : item.state==1 ? "Active" : item.state==3 ? "Defeated" : item.state==4 ? "Success" : item.state==5 ? "Queued" : item.state==6 ? "Expired" : item.state==7 ? "Executed": "Unknown"  }
                  </span>
                <div className="text-[10px] text-gray-500">
                  {item.votes.length} votes cast
                  {item.votes.map((vote: any) => (
                    <div key={vote.id} className="text-[10px] text-gray-500">
                     {/*  {vote.voter}  */} voted {vote.support==1 ? <span className="text-green-500">for</span> : <span className="text-red-500">against</span>} with {formatUnits(vote.weight, 18)} IGT Token weight
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-left">
                  {item.state==4 && item.votes.length>0 ? <button type="button" className="bg-blue-500 text-white px-1 py-1 rounded-md cursor-pointer" onClick={() => queueProposal(item.proposalId, item.targets, item.values, item.calldatas, item.description)}>Queue</button> : ""}
                  {item.state==5 && item.votes.length>0 ? <button type="button" className="bg-red-500 text-white px-1 py-1 rounded-md cursor-pointer" onClick={() => executeProposal(item.proposalId, item.targets, item.values, item.calldatas, item.description)}>Execute</button> : ""}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  
       
         


    </div>
  );
}