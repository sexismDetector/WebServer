
export default interface Tweet {
    id?: string | null;
    text: string;
    label?: string;
    hashtags?: any[]; //Pending
    user_mentions?: any[];
    source?: string;
    user_id?: string;
    reply_status_id?: string;
}