import * as z from "zod";
import { isAddress } from "viem"; // ethers v6

/* export const ProposalData = z.object({
  prposal_description: z.coerce.string().min(20, "Proposal description  required"),
  burn_token_value: z.coerce.number().min(10, "Time must be greater than 10"),
  mint_token_value: z.coerce.number().min(10, "Time must be greater than 10"),
  transfer_token_value: z.coerce.number().min(10, "Time must be greater than 10"),
  mint_receiver_address: z.coerce.string().refine(isAddress, "Invalid address"),
  transfer_receiver_address: z.coerce.string().refine(isAddress, "Invalid address"),
  }); */
  export const ProposalData = z.discriminatedUnion("proposal_type", [

    z.object({
      proposal_type: z.literal("increment_value"),
      prposal_description: z.string().min(20),
      increment_value: z.coerce.number().min(1),
    }),
  
    z.object({
      proposal_type: z.literal("mint_token"),
      prposal_description: z.string().min(20),
      mint_token_value: z.coerce.number().min(1),
      mint_receiver_address: z.string().refine(isAddress, "Invalid address"),
    }),
  
    z.object({
      proposal_type: z.literal("burn_token"),
      prposal_description: z.string().min(20),
      burn_token_value: z.coerce.number().min(1),
    }),
  
    z.object({
      proposal_type: z.literal("transfer_token"),
      prposal_description: z.string().min(20),
      transfer_token_value: z.coerce.number().min(1),
      transfer_receiver_address: z.string().refine(isAddress, "Invalid address"),
    }),
  
  ])

export const DelegateToAnother = z.object({
  delegateTo: z.coerce.string().refine(isAddress, "Invalid address"),
})

  
  