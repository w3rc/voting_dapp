import axios from 'axios';

export const getMessages = async (topicId: string) => {
    const messages = await axios.get(`https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages`)
    return messages;
}

export const decodeMessages = (messages: any) => {
    return messages.map((message: any) => {
        const decodedMessage = atob(message.message); // Base64 decode
        return JSON.parse(decodedMessage); // Parse JSON string into JavaScript object
    });
}


export const getElections = async () => {
    const elections = await getMessages(import.meta.env.VITE_ELECTION_CREATED_TOPIC_ID as string)
    return decodeMessages(elections.data.messages);
}

export const getEndedElections = async () => {
    const pastElections = await getMessages(import.meta.env.VITE_ELECTION_ENDED_TOPIC_ID as string)
    return decodeMessages(pastElections.data.messages);
}

export const getOngoingElections = async () => {
    const createdElections = await getElections();
    const endedElections = await getEndedElections();
    const endedElectionIds = new Set(endedElections.map((election: any) => election.electionId));

    const ongoingElections = createdElections.filter((election: any) => !endedElectionIds.has(election.electionId) );
    return ongoingElections;
}

export const getCandidates = async (electionId: any) => {
    const candidates = await getMessages(import.meta.env.VITE_CANDIDATE_ADDED_TOPIC_ID as string)
    const decodedMessages = decodeMessages(candidates.data.messages);
    return decodedMessages.filter((message: any) => message.electionId === electionId);
}