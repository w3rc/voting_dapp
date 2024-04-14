import { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ContractFunctionParameterBuilder } from '@/services/wallets/contractFunctionParameterBuilder';
import { ContractId } from '@hashgraph/sdk';

const ElectionDialog = ({election, candidates, walletInterface}:any) => {
    const [voteDialogOpen, setVoteDialogOpen] = useState(false);
    const [candidateToVote, setCandidateToVote] = useState('');
    const [voting, setVoting] = useState(false);

    return (
        <Dialog open={voteDialogOpen} onOpenChange={setVoteDialogOpen}>
            <DialogTrigger asChild>
                <Button>Vote</Button>
            </DialogTrigger>
            {voteDialogOpen && <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Cast your Vote</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid w-full gap-4">
                        <Label htmlFor="name" className="text-left">
                            Name
                        </Label>
                        <Select onValueChange={(value) => setCandidateToVote(value)}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Candidate" />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    candidates
                                        .filter((candidate: any) => candidate.electionId === election.electionId)
                                        .map((candidate: any) => {
                                            if (candidate.electionId === election.electionId) {
                                                return candidate.candidates.map((candidate: any, index: number) => {
                                                    console.log(candidate)
                                                    return (
                                                        <SelectItem key={index} value={candidate.candidateId}>
                                                            {candidate.candidateName ? candidate.candidateName.replaceAll('\'', '') : candidate.candidateId}
                                                        </SelectItem>
                                                    )
                                                })
                                            }
                                        })
                                }
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => {
                        setVoting(true);
                        walletInterface?.executeContractFunction(ContractId.fromString(import.meta.env.VITE_CONTRACT_ID), 'vote', new ContractFunctionParameterBuilder().addParam({ type: 'uint256', name: '_electionId', value: election.electionId }).addParam({ type: 'uint256', name: "_candidateId", value: candidateToVote }), 1750000).then((result: any) => {
                            console.log("Contract Executed", result);
                            setVoteDialogOpen(false);
                        }).catch((error: any) => {
                            console.error("Error Executing Contract", error);
                        }).finally(() => {
                            setVoting(false);
                        })
                    }} type="submit">{voting ? "Loading..." : "Vote"}</Button>
                </DialogFooter>
            </DialogContent>}
        </Dialog>
    );
}

export default ElectionDialog