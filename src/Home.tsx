import { useEffect, useState } from 'react'
import './App.css'
import { Button } from './components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog'
import { Label } from './components/ui/label'
import { Input } from './components/ui/input'
import { Textarea } from './components/ui/textarea'
import { useWalletInterface } from './services/wallets/useWalletInterface';
import { WalletSelectionDialog } from './components/WalletSelectionDialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from './components/ui/dropdown-menu'
import { getCandidates, getElections, getEndedElections, getOngoingElections } from './services/topic/getMessages'
import { ContractFunctionParameterBuilder } from './services/wallets/contractFunctionParameterBuilder'
import { ContractId } from '@hashgraph/sdk'
import OngoingElectionsCard from './components/OngoingElectionsCard'
import PastElectionsCard from './components/PastElectionsCard'
import { useToast } from './components/ui/use-toast'

interface Candidate {
    electionId: number;
    candidates: any[];
}

function Home() {
    const [open, setOpen] = useState(false);
    const { accountId, walletInterface } = useWalletInterface();
    const [electionName, setElectionName] = useState('')
    const [electionCandidates, setElectionCandidates] = useState('')
    const [pastElections, setPastElections] = useState([]);
    const [ongoingElections, setOngoingElections] = useState([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [addElectionDialogOpen, setAddElectionDialogOpen] = useState(false);
    const [fetchingOngoingElections, setFetchingOngoingElections] = useState(true);
    const [fetchingPastElections, setFetchingPastElections] = useState(true);
    const [addingElection, setAddingElection] = useState(false);
    const { toast } = useToast();

    const getAndSetEndedElections = async () => {
        const elections = await getEndedElections();
        if (elections.length) {
            const uniqueElections = elections.filter((election: { electionId: any }, index: any, self: any[]) =>
                index === self.findIndex((e) => (
                    e.electionId === election.electionId
                ))
            );
            setPastElections(uniqueElections);
        } else {
            setPastElections([]);
        }
        setFetchingPastElections(false);
    }

    const getAndSetOngoingElections = async () => {
        const elections = await getOngoingElections();
        console.log(elections);
        if (elections.length) {
            const uniqueElections = elections.filter((election: { electionId: any }, index: any, self: any[]) =>
                index === self.findIndex((e) => (
                    e.electionId === election.electionId
                ))
            );
            setOngoingElections(uniqueElections);
        } else {
            setOngoingElections([]);
        }
        setFetchingOngoingElections(false);
    }

    useEffect(() => {
        const intervalId = setInterval(() => {
            getAndSetEndedElections();
            getAndSetOngoingElections();
            getElections().then(async (elections) => {
                if (elections.length > 0) {
                    elections.forEach(async (election: any) => {
                        const candidatesByElectionId = await getCandidates(election.electionId);
                        setCandidates((prev: any) => {
                            const index = prev.findIndex((candidatesByElectionId: any) => candidatesByElectionId.electionId === election.electionId);

                            if (index === -1) {
                                return [...prev, { electionId: election.electionId, candidates: candidatesByElectionId }];
                            } else {
                                prev[index] = { electionId: election.electionId, candidates: candidatesByElectionId };
                            }
                            return prev;
                        });
                    });
                }
            });
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        console.log(candidates);
    }, [candidates])

    const handleConnect = async () => {
        if (accountId) {
            localStorage.removeItem("usedBladeForWalletPairing");
        } else {
            setOpen(true);
        }
    };

    useEffect(() => {
        console.log('App', accountId)
        if (accountId) {
            setOpen(false);
        }
    }, [accountId])


    return (
        <>
            <div className='flex mt-5 px-10 justify-center relative'>
                <div />
                <div className='text-2xl'>Voting DApp</div>
                <div onClick={handleConnect} className='border-white border-2 px-4 py-2 absolute right-10'>
                    {accountId ? <DropdownMenu>
                        <DropdownMenuTrigger>{`Connected: ${accountId}`}</DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>
                                <Button onClick={() => {
                                    walletInterface?.disconnect();
                                }}>Disconnect</Button>
                            </DropdownMenuLabel>
                        </DropdownMenuContent>
                    </DropdownMenu>
                        : 'Connect Wallet'}
                </div>
            </div>

            <WalletSelectionDialog open={open} onClose={() => setOpen(false)} />


            <div className='px-10 mt-10'>
                <div className='flex justify-between items-center'>
                    <div className='text-2xl'>Ongoing Elections: {ongoingElections.length}</div>
                    <Dialog open={addElectionDialogOpen} onOpenChange={setAddElectionDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>Add Election</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add Election</DialogTitle>
                                <DialogDescription>
                                    Add details of the Election you want to conduct. Click save when you're done.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid w-full gap-4">
                                    <Label htmlFor="name" className="text-left">
                                        Name
                                    </Label>
                                    <Input id="name" value={electionName} onChange={(e: any) => setElectionName(e.target.value)} className="col-span-3" />
                                </div>
                                <div className="grid w-full gap-4">
                                    <Label htmlFor="candidates" className="text-left">
                                        Candidates
                                    </Label>
                                    <Textarea id="candidates" value={electionCandidates} onChange={(e) => setElectionCandidates(e.target.value)} className="col-span-3" />
                                    <p className="text-sm text-muted-foreground">
                                        Add candidates seperated by comma
                                    </p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={() => {
                                    setAddingElection(true);
                                    if (electionCandidates.trim() === '') {
                                        console.error('No candidates provided');
                                        return;
                                    }
                                    const candidatesArray = electionCandidates.split(',').map(candidate => `'${candidate.trim()}'`);
                                    if (!candidatesArray.length) {
                                        console.error('No candidates provided');
                                        return;
                                    }
                                    walletInterface?.executeContractFunction(ContractId.fromString(import.meta.env.VITE_CONTRACT_ID), 'createElection', new ContractFunctionParameterBuilder().addParam({ type: 'string', name: '_name', value: electionName }), 1750000).then((result) => {
                                        console.log("Contract Executed", result);

                                        const promises = candidatesArray.map(candidate => {
                                            return walletInterface?.executeContractFunction(ContractId.fromString(import.meta.env.VITE_CONTRACT_ID), 'addCandidateByElectionName', new ContractFunctionParameterBuilder().addParam({ type: 'string', name: '_electionName', value: electionName }).addParam({ type: 'string', name: '_candidateName', value: candidate }), 1750000);
                                        });

                                        Promise.all(promises)
                                            .then((results) => {
                                                console.log("All contracts executed", results);
                                                setAddElectionDialogOpen(false);
                                                setAddingElection(false);
                                                setElectionName('');
                                                setElectionCandidates('');
                                            })
                                            .catch((error) => {
                                                console.error("Error executing contracts", error);
                                                setAddingElection(false);
                                            });
                                    }).catch((error) => {
                                        console.error("Error Executing Contract", error);
                                        let errorDescription = "Something went wrong";
                                        if (error === "0xb86232d4000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000046265746100000000000000000000000000000000000000000000000000000000") {
                                            errorDescription = "Election With Same Name already exists";
                                        }
                                        toast({
                                            title: "Error",
                                            description: errorDescription,
                                            variant: "destructive",
                                        });
                                        setAddingElection(false);
                                    })

                                }}>
                                    {addingElection ? "Loading..." : "Save changes"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="flex flex-wrap justify-start items-stretch gap-10 mt-10">
                    {fetchingOngoingElections && <div className='mt-10 flex justify-center w-[100%] text-xl'>Fetching ongoing elections...</div>}
                    {!fetchingOngoingElections && (ongoingElections.length > 0 ? ongoingElections.map((election: any) => {
                        return <OngoingElectionsCard key={election.electionId} election={election} candidates={candidates} walletInterface={walletInterface} />
                    }) : <div className='mt-10 flex justify-center w-[100%] text-xl'>No ongoing elections</div>)
                    }
                </div>
            </div>

            <div className='px-10 mt-10'>
                <div className='flex justify-between items-center'>
                    <div className='text-2xl'>Past Elections: {pastElections.length}</div>
                </div>
                <div className="flex flex-wrap justify-start items-stretch gap-10 mt-10">
                    {fetchingPastElections && <div className='mt-20 flex justify-center w-[100%] text-xl'>Fetching past elections...</div>}
                    {
                        !fetchingPastElections && (pastElections.length > 0 ? pastElections.map((election: any) => {
                            return <PastElectionsCard key={election.electionId} election={election} candidates={candidates} />
                        }) : <div className='mt-20 flex justify-center w-[100%] text-xl'>No past elections Yet</div>)
                    }
                </div>
            </div>
        </>
    )
}

export default Home



