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

// Base properties shared by all polls
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