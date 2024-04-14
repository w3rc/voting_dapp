import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const PastElectionsCard = ({ election, candidates }: any) => {
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
                <div className='flex items-center'>Winner: <div className='font-bold ml-2'>{election.winnerName.trim() !== "" ? election.winnerName.replaceAll('\'', '') : "None"}</div></div>
            </CardFooter>
        </Card>
    )
}

export default PastElectionsCard