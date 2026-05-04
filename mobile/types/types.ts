export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null; 
  role: 'user' | 'admin'; 
  banned: boolean;
  createdAt: string;
  updatedAt: string; 
}

export interface SignupData {
  token: string | null;
  user: User;
}

export interface SignupResponse {
  message: string;
  data?: SignupData;
  step?:string
}

export interface VerifyOtpParams {
    email:string,
    otp:string
}

export interface OtpUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string;
  createdAt: string; 
  updatedAt: string; 
  role: "user" | "admin"; 
  banned: boolean;
}

export interface OtpResult {
  status: boolean;
  token: string | null;
  user: OtpUser;
}

export interface OtpResponse {
  message: string;
  result: OtpResult;
}

export interface SignInResponse {
  redirect: boolean;
  token: string;
  user: User;
}

export interface PollCount {
  votes: number;
}

export interface PollBase {
  id: string;
  authorId: string;
  editedById: string | null;
  categoryId: string;
  name: string;
  createdAt: string; 
  deadline: string;
  updatedAt: string;
  active: boolean;
  archived: boolean;
  banner: string | null;
  archivedAt: string | null;
  category:{
    title:string
  }
}

export interface FeaturedPoll extends PollBase {
  _count: PollCount;
}

export interface HomePollsResponse {
  data: {
    featuredPolls: FeaturedPoll[];
    activePolls: PollBase[]; 
  };
}

export interface PollMinimal {
  id: string;
  authorId: string;
  editedById: string | null;
  categoryId: string;
  name: string;
  createdAt: string;
  deadline: string;
  updatedAt: string;
  active: boolean;
  archived: boolean;
  banner: string | null;
  archivedAt: string | null;
}

export interface UserVote {
  id: string;
  deviceId: string;
  tier: 'FREE' | 'PREMIUM'; 
  createdAt: string;
  weight: number;
  userId: string;
  pollId: string;
  optionId: string;
  poll: PollMinimal;
}

export interface MyVotesResponse {
  data: {
    votes: UserVote[];
    count: number;
    pageLimit: number;
    hasMore: boolean;
  };
}

export interface MyProfile{
  id:string, 
  name:string, 
  image:string, 
  email:string
}

export interface Author {
  name: string;
  image: string;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string; 
  authorId: string;
  pollId: string;
  author: Author;
}

export interface Pagination {
  totalCount: number;
  currentPage: number;
  hasMore: boolean;
}

export interface CommentResponse {
  comments: Comment[];
  pagination: Pagination;
}

export enum PricingTier {
  FREE = "FREE",
  BASIC = "BASIC",
  PREMIUM = "PREMIUM",
  ULTRA = "ULTRA", 
}

export interface GetPollResponse {
  data: PollDetail;
}


export interface Nominee {
  id: string;
  pollId: string;
  nomineeId: string;
  name: string;
  bio: string | null;
  avatar: string | null;
  votes: number; 
}

export interface PollDetail {
  id: string;
  authorId: string;
  category: string;
  name: string;
  banner: string | null;
  createdAt: string; 
  deadline: string; 
  active: boolean;
  archived: boolean;
  totalVotes: number;
  currentVoteSpent: PricingTier[];
  nominees: Nominee[];
}

export interface PollResponse {
  data: PollDetail;
}