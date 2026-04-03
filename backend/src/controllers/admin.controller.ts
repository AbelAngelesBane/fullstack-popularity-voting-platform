import type { Request, Response } from "express";
import { auth } from "../lib/auth";

import { fromNodeHeaders } from "better-auth/node";
import { prisma } from "../lib/db";
import { uploadToSupabase } from "../helper/supabase-upload";

interface PollUpdateInput {
  name?: string;
  deadline?: Date | string;
  editedById: string;
  archived?: boolean;
  archivedAt?: Date | string
}

const weights = {
  FREE: 1,
  BASIC: 30,
  PREMIUM: 80,
};

export interface CreatePollInput {
  name: string;
  categoryId: string;
  deadline: Date | string;
  nomineeIds: string[];
}

export async function registerAdmin(req: Request, res: Response) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session || session.user.role !== "super_admin") {
    return res.status(403).json({ message: "Unauthorized" });
  }
  const { targetEmail } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { email: targetEmail },
      data: { role: "admin" },
    });
    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    return res.json({ message: `${targetEmail} is now an admin.` });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getInvoices(req: Request, res: Response) {
  const pageLimit = 10;
  try {
    const currentPage = parseInt(req.query.page as string) || 1;
    const [count, invoices] = await Promise.all([
      await prisma.invoice.count(),
      await prisma.invoice.findMany({
        take: pageLimit,
        skip: (currentPage - 1) * pageLimit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    res.json({
      data: invoices,
      meta: {
        count,
        currentPage,
        lastPage: Math.ceil(count / pageLimit),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getPolls(req: Request, res: Response) {
  const pageLimit = 10;
  try {
    const currentPage = parseInt(req.query.page as string) || 1;
    const  searchParams  = req.query.filter;

    
    const [count, polls] = await Promise.all([
      await prisma.poll.count(),
      await prisma.poll.findMany({
        ...(searchParams && searchParams !== "archived" && {where:{
          active:searchParams === "active" ? true : false 
        }}
      ),
      ...(searchParams && searchParams === "archived" && {
        where:{
          archived:true
        }
      }),
        take: pageLimit,
        skip: (currentPage - 1) * pageLimit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    res.json({
      data: polls,
      meta: {
        count,
        currentPage,
        lastPage: Math.floor(count / pageLimit),
      },
    });
  } catch (error) {
    console.log("Error on getPolls ", error)
    return res.status(500).json({ error: "Internal server error" });
  }
}

// export async function createPolls(req: Request, res: Response) {
//   try {
//     const { id } = req.user;

//     const { name, categoryId, deadline, nomineeIds } = req.body;
//     if (!name || !categoryId || !deadline || nomineeIds.length < 2) {
//       return res.status(400).json({
//         error:
//           "Bad request. Please provide a name,deadline,  category, and at least 2 nominees.",
//       });
//     }
//     console.log("user id: ", id);
//     const poll = await prisma.poll.create({
//       data: {
//         name,
//         authorId: id,
//         categoryId: categoryId,
//         deadline: new Date(deadline).toISOString(),
//         options: {
//           // I made a dumb code here before, I used connect! Let it be known!
//           create: nomineeIds.map((id: string) => ({
//             nomineeId: id,
//           })),
//         },
//       },
//       include: {
//         options: true,
//       },
//     });
//     return res.status(200).json({
//       data: poll,
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }

export async function createPolls(req: Request, res: Response) {
  try {
    const { id } = req.user;

    const { name, categoryId, deadline, nomineeIds, banner } = req.body;

    if (!name || !categoryId || !deadline || !nomineeIds || nomineeIds.length < 2) {
      return res.status(400).json({
        error: "Bad request. Please provide a name, deadline, category, and at least 2 nominees.",
      });
    }

    const poll = await prisma.poll.create({
      data: {
        name,
        authorId: id,
        categoryId: categoryId,
        banner: banner || null, 
        deadline: new Date(deadline).toISOString(),
        options: {
          create: nomineeIds.map((id: string) => ({
            nomineeId: id,
          })),
        },
      },
      include: {
        options: true,
      },
    });

    return res.status(200).json({
      data: poll,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updatePolls(req: Request, res: Response) {
  try {
    //For now, all admins can edit.
    const { name, deadline, isArchived } = req.body;
    const {pollId} = req.params;
    const { id } = req.user;



    const updatedData: PollUpdateInput = {
      editedById:id,
    };

    if (name) {
      updatedData.name = name;
    }

    if (deadline) {
      const formattedDate = new Date(deadline);
      if (isNaN(formattedDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }
      updatedData.deadline = formattedDate;
    }
    if(isArchived){
      if(isArchived === "true" || isArchived === "false"){
        updatedData.archived = isArchived === "true" ? true : false
      }
      
    }

    //If deadline is not later than today,intercept
    const deadlineDate = new Date(deadline);
    const now = new Date();
    if(deadlineDate < now)return res.status(400).json({ error: "The deadline cannot be in the past." });
    

    if (!name && !deadline && !isArchived) {
      return res.status(400).json({ error: "Nothing to update" });
    }
    if(!pollId || pollId === ""){
      return res.status(400).json({ error: "Missing params" });
    }
    const poll = await prisma.poll.update({
      where: { id: pollId as string },
      data: {...updatedData,
      ...((isArchived && isArchived === true) && {archivedAt: new Date()})
      },
    });

    return res.status(200).json(poll);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}
export async function getPollById(req: Request, res: Response) {
  try {
    const { pollId } = req.params as {pollId: string};
    if (!pollId)return res.status(400).json({ error: "Required param missing" });
    const poll = await prisma.poll.findFirst({
      where: {
        id: pollId,
      },
      include:{
        category:true,
        options:{
          include:{
            nominee:true,
            _count:{
              select:{votes:true}
            }
          }
        },
        comments:true
      }
    });
    if (!poll) return res.status(404).json({ error: "Poll not found" });
    const totalVotes = poll?.options.reduce((init, opt)=>init + opt._count.votes,0)
    const response = {
            "id": poll.id,
            "authorId": poll.authorId,
            "editedById": poll.editedById,
            "category": poll.category.title,
            "name": poll.name,
            "createdAt": poll.createdAt,
            "deadline": poll.deadline,
            "updatedAt": poll.updatedAt,
            "active": poll.active,
            "archived":poll.archived,
            "archivedAt":poll.archivedAt,
            totalVotes,
            "nominees":poll.options.map((item) =>{
              return {
                "id":item.id,
                "pollId":item.pollId,
                "nomineeId":item.id,
                "name":item.nominee.name,
                "bio": item.nominee.bio,
                "avatar":item.nominee.avatar,
                "votes":item._count.votes,
              }
            })
    }
    return res.status(200).json({ data: {response} });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function createCategory(req: Request, res: Response) {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "Bad request" });
    const categ = await prisma.category.create({
      data: {
        title,
      },
    });
    res.status(200).json({
      data: categ,
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getCategories(req: Request, res: Response) {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json({ data: categories });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function registerNominees(req: Request, res: Response) {
  try {
    const avatar = req.file;
    const { name, bio } = req.body;
    
    
    if (!name || !bio || !avatar)
      return res
        .status(404)
        .json({ error: `Required field or values missing: ${Object.keys(req.body)}` });

    const imgUrl = await uploadToSupabase(avatar!);
    const profile = await prisma.nominee.create({
      data: {
        avatar: imgUrl,
        name,
        bio,
      },
    });
    res.status(200).json({
      data: profile,
    });
  } catch (error) {
    console.log("Error adding nominee", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}



export async function searchNominees(req: Request, res: Response) {
  const limit = 7;
  try {
        console.log("RESULT", req.body)

    const { alreadyLoaded, searchInput } = req.body;
    const results = await prisma.nominee.findMany({
      where: {
        OR: [
          { name: { startsWith: searchInput} },
          { name: { contains: searchInput } },
          { name: { equals: searchInput } }, // Optional: Exact match priority
        ],
      },
      take: limit + 1, // For "Show More" logic
      skip: alreadyLoaded,
      orderBy: { id: "asc" },
    });
    

    const hasMore = results.length > limit;

    const data = hasMore ? results.slice(0, -1) : results;

    return res.status(200).json({
      nominees: data,
      hasMore: hasMore,
      nextSkip: alreadyLoaded + data.length,
    });
  } catch (error) {
    console.log("Error here: ", error);
    return res.status(500).json({ error: `Internal server error ${error}` });
  }
}
// export async function filterPollsByCateg(req: Request, res: Response){
//   try {
//     const {categ, }
//   } catch (error) {
    
//   }
// }