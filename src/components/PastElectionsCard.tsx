import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { getVotes } from '@/services/topic/getMessages'

const PastElectionsCard = ({ election, candidates }: any) => {
    const [winnerName, setWinnerName] = useState('');
    useEffect(() => {
        getVotes(election.electionId).then((votes: any) => {
            console.log(votes);
            if (!votes.length) {
                return;
            }
            const voteCount = votes.reduce((acc: any, vote: any) => {
                if (acc[vote.candidateId]) {
                    acc[vote.candidateId] += 1;
                } else {
                    acc[vote.candidateId] = 1;
                }
                return acc;
            }, {});
            const winnerId = Object.keys(voteCount).reduce((a, b) => voteCount[a] > voteCount[b] ? a : b);
            const electionCandidateList = candidates.find((candidate: any) => candidate.electionId === election.electionId).candidates;
            console.log(electionCandidateList);
            const winner = electionCandidateList.find((candidate: any) => candidate.candidateId === winnerId);
            console.log(winner);
            setWinnerName(winner?.candidateName.replaceAll('\'', '') ?? winnerId);
        });
    }, [])

    return (
        <Card key={election.electionId} className={cn("min-w-[380px] flex flex-col")}>
            <CardHeader>
                <CardTitle>{election.electionName ?? "Untitled"}</CardTitle>
                <CardDescription>Results announced on {format(new Date(Number((Number(election.timestamp) * 1000).toString().split(".")[0])), 'PPpp')}</CardDescription>
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
            <CardFooter className='flex justify-center mt-auto'>
                <div className='flex items-center'>Winner: <div className='font-bold ml-2'>{winnerName ? winnerName : "None"}</div></div>
            </CardFooter>
        </Card>
    )
}

export default PastElectionsCard