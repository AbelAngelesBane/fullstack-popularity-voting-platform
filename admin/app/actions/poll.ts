"use server";
import { BASE_URL } from "@/lib/utils";
import {
  CreateCategoryResponse,
  CreatePollParams,
  Nominees,
  PollCommentsResponse,
  PollDetailResponse,
  PollResponse,
  SearchResult,
} from "@/types/poll";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface CreateNomineeResponse {
  data: Nominees;
}
export interface SinglePollResponse {
  data: DetailedPollData;
}


export async function getPollComments({
  pollId,
  page,
}: {
  pollId: string;
  page: number;
}) {
  let isSignedIn = true;
  let data: PollCommentsResponse;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const url = new URL(`${BASE_URL}api/user/comments/${pollId}`);
    if (page && page !== 1) {
      url.searchParams.append("page", page.toString());
    }
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 401) {
      isSignedIn = false;
    }
    data = await response.json();
  } catch (error) {
    return { error: error };
  }
  if (!isSignedIn) redirect("/auth/signin");
  return data;
}
export async function addComment({
  pollId,
  page,
}: {
  pollId: string;
  page: number;
}) {
  let isSignedIn = true;
  let data: PollCommentsResponse;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const url = new URL(`${BASE_URL}api/user/comments/${pollId}`);
    if (page && page !== 1) {
      url.searchParams.append("page", page.toString());
    }
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 401) {
      isSignedIn = false;
    }
    data = await response.json();
  } catch (error) {
    return { error: error };
  }
  if (!isSignedIn) redirect("/auth/signin");
  return data;
}

interface updatePollParams {
  name?: string;
  deadLine?: string;
  archived?: boolean;
}


export interface DetailedPollData {
  id: string;
  authorId: string;
  editedById: string | null;
  categoryId: string;
  name: string;
  createdAt: string;
  deadline: string;
  updatedAt: string;
  active: boolean;
  options: PollOption[];
}

export interface PollOption {
  id: string;
  pollId: string;
  nomineeId: string;
}

export async function fetchPollAction(filter?: string) {
  let isSignedIn = true;
  let data: PollResponse;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    const url = new URL(`${BASE_URL}api/admin/polls`);
    if (filter && filter !== "all") {
      url.searchParams.append("filter", filter);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      isSignedIn = false;
    }

    data = await response.json();
  } catch (error) {
    console.error("Fetch Error:", error);
    return { error: "Something went wrong" };
  }

  if (!isSignedIn) redirect("/auth/signin");
  return data.data;
}

export async function searchNominees({
  searchInput,
  alreadyLoaded,
}: {
  searchInput: string;
  alreadyLoaded: number;
}) {
  let isSignedIn = true;
  let data: SearchResult;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const response = await fetch(`${BASE_URL}api/admin/searchNominee`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        searchInput: searchInput,
        alreadyLoaded: 0,
      }),
    });
    if (response.status === 401) {
      isSignedIn = false;
    }
    data = await response.json();
  } catch (error) {
    return { error: "Something went wrong" };
  }
  if (!isSignedIn) redirect("/auth/signin");
  return data;
}

export async function createNomineeProfile(formData: FormData) {
  let isSignedIn = true;
  let data: CreateNomineeResponse;
  try {
    console.log("data form:", formData);
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const response = await fetch(`${BASE_URL}api/admin/nominees`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (response.status === 401) {
      isSignedIn = false;
    }
    data = await response.json();
  } catch (error) {
    return { error: error };
  }
  if (!isSignedIn) redirect("/auth/signin");
  return data.data;
}

export async function createPoll({ formData }: { formData: FormData }) {
  let isSignedIn = true;
  let data: SinglePollResponse;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    console.log("RESPONSE IN POLLCERA:", formData);

    const response = await fetch(`${BASE_URL}api/admin/poll`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    console.log("resp: ", response)
    if (response.status === 401) {
      isSignedIn = false;
    }
    data = await response.json();
} catch (error) {
    return { error: error };
  }
  if (!isSignedIn) redirect("/auth/signin");
  return data.data;
}

export async function getPollById({ pollId }: { pollId: string }) {
  let isSignedIn = true;
  let data: PollDetailResponse;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const response = await fetch(`${BASE_URL}api/admin/poll/${pollId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 401) {
      isSignedIn = false;
    }
    data = await response.json();
  } catch (error) {
    return { error: error };
  }
  if (!isSignedIn) redirect("/auth/signin");
  return data.data.response;
}

export async function updatePoll({
  pollId,
  bodyParam,
}: {
  pollId: string;
  bodyParam: updatePollParams;
}) {
  let isSignedIn = true;
  let data;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const url = new URL(`${BASE_URL}api/admin/poll/${pollId}`);
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bodyParam),
    });
    if (response.status === 401) {
      isSignedIn = false;
    }
    data = response.status;
  } catch (error) {
    return { error: error };
  }
  if (!isSignedIn) redirect("/auth/signin");
  return data;
}

export async function addCategory(categoryTitle: string) {
  let isSignedIn = true;
  let data: CreateCategoryResponse;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const url = new URL(`${BASE_URL}api/admin/category`);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({title:categoryTitle}),
    });
    if (response.status === 401) {
      isSignedIn = false;
    }
    data = await response.json()
  } catch (error) {
    return { error: error };
  }
  if (!isSignedIn) redirect("/auth/signin");
  return data;
}

export async function getCategories() {
  let isSignedIn = true;
  let data: CreateCategoryResponse;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    const url = new URL(`${BASE_URL}api/admin/categories`);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 401) {
      isSignedIn = false;
    }
    data = await response.json();
  } catch (error) {
    return { error: error };
  }
  if (!isSignedIn) redirect("/auth/signin");
  return data;
}
