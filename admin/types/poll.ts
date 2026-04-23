

export interface PollResponse {
    data: PollData[]
}

export interface PollData {
    id: string;
    authorId: string;
    editedById: string | null;
    categoryId: string;
    name: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    deadline: string;
}



export interface SearchResult {
    nominees: Nominees[],
    hasMore: boolean,
    nextSkip: number
}

export interface Nominees {
    name: string,
    bio: string,
    avatar: string,
    id: string
}

export interface CreatePollParams{
    name: string,
    categoryId: string,
    nomineeIds:string[],
    deadline:string,
    banner: File
}

export interface NomineeDetail {
  id: string;
  pollId: string;
  nomineeId: string;
  name: string;
  bio: string;
  avatar: string;
  votes: number;

}

export interface PollData {
  id: string;
  authorId: string;
  editedById: string | null; 
  category: string;
  name: string;
  createdAt: string; 
  deadline: string;
  updatedAt: string;
  active: boolean;
  totalVotes: number;
  nominees: NomineeDetail[];
    archived: boolean;
  archivedAt:string | null
}

export interface PollDetailResponse {
  data: {
    response: PollData;
  };
}

export interface CommentAuthor {
  name: string;
  image: string;
}

export interface PollComment {
  id: string;
  text: string;
  createdAt: string; 
  authorId: string;
  pollId: string;
  author: CommentAuthor;
}

export interface Pagination {
  totalCount: number;
  currentPage: number;
  hasMore: boolean;
}

export interface PollCommentsResponse {
  comments: PollComment[];
  pagination: Pagination;
}

export interface Category {
  id: string;
  title: string;
}

export interface CreateCategoryResponse {
  data: Category;
}