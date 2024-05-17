export enum VoteType {
  NONE = "none",
  UPVOTE = "upvote",
  DOWNVOTE = "downvote",
}

export type Vote = {
  id: number;
  vote: VoteType;
  created_at: string;
  updated_at: string;
};
