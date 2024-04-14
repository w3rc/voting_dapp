import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import ElectionDialog from './ElectionDialog'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { ContractFunctionParameterBuilder } from '@/services/wallets/contractFunctionParameterBuilder'
import { ContractId } from '@hashgraph/sdk'
import { useState } from 'react'
import { useToast } from './ui/use-toast'

const OngoingElectionsCard = ({ election, candidates, walletInterface }: any) => {
    const [endingElection, setEndingElection] = useState(false);
    const { toast } = useToast()

    return (
        <Card key={election.electionId} className={cn("min-w-[380px] flex flex-col")}>
            <CardHeader>
                <CardTitle>{election.electionName ?? "Untitled"}</CardTitle>
                <CardDescription>Started on {format(new Date(Number((Number(election.timestamp) * 1000).toString().split(".")[0])), 'PPpp')}</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Candidates</p>
                <ul className="list-disc list-inside mt-4">
                    {
                        candidates.map((candidate: any) => {
                            if (candidate.electionId === election.electionId) {
                                return candidate.candidates.map((candidate: any) => {
                                    return (
                                        <li key={candidate.candidateId}>{(candidate.candidateName ? candidate.candidateName.replaceAll('\'', '') : candidate.candidateId)}</li>
                                    )
                                })
                            }
                        })
                    }
                </ul>
            </CardContent>
            <CardFooter className='flex items-center gap-4 mt-auto'>
                <ElectionDialog election={election} candidates={candidates} walletInterface={walletInterface} />
                <Button onClick={() => {
                    setEndingElection(true);
                    walletInterface?.executeContractFunction(ContractId.fromString(import.meta.env.VITE_CONTRACT_ID), 'endElection', new ContractFunctionParameterBuilder().addParam({ type: 'uint64', name: '_electionId', value: election.electionId }), 150000)
                        .then((result:any) => {
                            console.log("Contract Executed", result);
                        }).catch((error:any) => {
                            console.error("Error Executing Contract", error);
                            toast({
                                title: "Error",
                                description: "There was an error voting for the candidate",
                                variant: "destructive",
                            });
                        }).finally(() => {
                            setEndingElection(false);
                        })
                }} variant="destructive">{endingElection ? "Loading..." : "End Election"}</Button>

            </CardFooter>
        </Card>
    )
}

export default OngoingElectionsCard