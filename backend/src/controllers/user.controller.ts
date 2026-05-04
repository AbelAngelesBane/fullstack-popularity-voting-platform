import type { Request, Response } from "express";

import { prisma } from "../lib/db";
import { error } from "node:console";
import { pusher } from "../lib/pusher";
import type { PricingTier } from "../generated/prisma";

interface Profile{
  image?:string;
  name?:string
}

const weights = {
  FREE: 1,
  BASIC: 5,
  PREMIUM: 8,
};

export async function registerVote(req: Request, res: Response) {

  try {
    //use xendit here or stripe or whatever payment api, Ill implement later.
    const requiredFields = ["tier", "pollId", "optionId"];
    const { tier, pollId, optionId } = req.body;
    const user = req.user;
    const err: String[] = [];

    const body = Object.keys(req.body);
    requiredFields.forEach((item) => {
      if (!body.includes(item)) err.push(item);
    });
    if (!tier || !pollId || !optionId) {
      return res.status(400).json({ error: "Empty required field(s)" });
    }

    if (err.length > 0)
      return res.status(400).json({
        error:
          err.length > 1
            ? `required fields ${err} missing`
            : `required field ${err} missing`,
      });

    //check if active

    const isActive = await prisma.poll.findFirst({
      where: {
        id: pollId,
        archived: false,
        active: true,
      },
    });

    if (!isActive)
      return res
        .status(400)
        .json({ error: "This poll is closed or does not exist." });

    //Check if free votes exist
    const isVoteExisting = await prisma.vote.findMany({
          where: {
            userId:user.id,
            pollId: pollId,
          },
        });

    if (tier.toUpperCase() === "FREE") {
        if (isVoteExisting.findIndex((item)=> item.tier === "FREE") !== -1){
          return res.status(403).json({ error: "Only one free vote at a time" });}
        else {
          const vote = await prisma.vote.create({
            data: {
              tier: "FREE",
              weight: weights.FREE,
              poll: {
                connect: { id: pollId },
              },
              option: {
                connect: { id: optionId },
              },
              user: {
                connect: { id: user!.id },
              },
            },
          });
          return res.status(200).json({
            data: vote,
          });
        }
      
    } else if (
      tier.toUpperCase() === "BASIC" ||
      tier.toUpperCase() === "PREMIUM"
    ) 
    {
    //AD BASED PREMIUMS
     const tierParsed:PricingTier =  tier.toUpperCase().trim()
     if (isVoteExisting.findIndex((item)=> item.tier === tierParsed)!== -1){
          return res.status(403).json({ error: `Only one ${tier} vote at a time` });}
        const vote = await prisma.vote.create({
            data: {
              tier: tierParsed,
              weight: weights[tierParsed],
              poll: {
                connect: { id: pollId },
              },
              option: {
                connect: { id: optionId },
              },
              user: {
                connect: { id: user!.id },
              },
            },
          });
          return res.status(200).json({
            data: vote,
          });
        }
  } catch (error) {
    console.log("error on add vote", error)
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function addComment(req: Request, res: Response) {
  try {
    const { id } = req.user!;
    const { text, pollId } = req.body;
    // return res.status(200).json({id, user:name})
    if (!text || !pollId)
      return res.status(400).json({ error: "Required fields missing" });
    const comment = await prisma.comment.create({
      data: {
        text,
        poll: { connect: { id: pollId } },
        author: { connect: { id: id }, }, 
      },
      include:{
        author:{select:{id:true, image:true, name:true}}
      }
    });
    pusher.trigger(`poll-comment-${pollId}`,'new-comment',{
      comment
    })

    return res.status(200).json({ data: comment });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}


// export async function getPollComments(req: Request, res: Response) {
//   try {
//     const { id } = req.params;
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = 10;
//     const skip = (page - 1) * limit;

//     if (!id || id === "undefined") {
//       return res
//         .status(400)
//         .json({ error: "Missing Poll ID in request parameters." });
//     }

//     const [comments, totalCount] = await prisma.$transaction([
//       prisma.comment.findMany({
//         where: { pollId: id as string },
//         take: limit,
//         skip: skip,
//         orderBy: { createdAt: "desc" },
//         include: {
//           author: {
//             select: { name: true, image: true },
//           },
//         },
//       }),
//       prisma.comment.count({
//         where: { pollId: id as string },
//       }),
//     ]);

//     const hasMore = skip + comments.length < totalCount;

//     return res.status(200).json({
//       comments,
//       pagination: {
//         totalCount,
//         currentPage: page,
//         hasMore,
//       },
//     });
//   } catch (error) {
//     console.error("Fetch Comments Error:", error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// }


export async function getPollComments(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const commentsShown = parseInt(req.query.commentShown as string) || 1;
    console.log("commentShown", commentsShown)
    const limit = 10;
    const skip = commentsShown;
    
    if (!id || id === "undefined") {
      return res
        .status(400)
        .json({ error: "Missing Poll ID in request parameters." });
    }

    const [comments, totalCount] = await prisma.$transaction([
      prisma.comment.findMany({
        where: { pollId: id as string },
        take: limit,
        skip: skip,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: { name: true, image: true },
          },
        },
      }),
      prisma.comment.count({
        where: { pollId: id as string },
      }),
    ]);

    const hasMore = (comments.length + commentsShown) < totalCount;

    return res.status(200).json({
      comments,
      pagination: {
        totalCount,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Fetch Comments Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function searchPoll(req: Request, res: Response) {
  try {
    const { searchQuery, hasLoaded} = req.query;

    if (!searchQuery) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const limit = 10;
    const skip = parseInt((hasLoaded ?? 0) as string);

    // Use a transaction to get both data and the total count in one go
    const [polls, totalCount] = await prisma.$transaction([
      prisma.poll.findMany({
        where: {
          archived: false,
          OR: [
            { name: { contains: searchQuery.toString() } },
            {
              options: {
                some: {
                  nominee: {
                    name: {
                      contains: searchQuery.toString(),
                    },
                  },
                },
              },
            },
          ],
        },
        include: {
          options: true,
          category: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: skip,
      }),
      prisma.poll.count({
        where: {
          archived: false,
          OR: [
            { name: { contains: searchQuery.toString() } },
            {
              options: {
                some: {
                  nominee: {
                    name: {
                      contains: searchQuery.toString(),
                    },
                  },
                },
              },
            },
          ],
        },
      }),
    ]);

    //skip is parsed hasLoaded from query / front-end.
    const hasMore = (polls.length + skip) < totalCount;

    return res.status(200).json({
      data: {
        polls,
        pagination: {
          totalCount,
          hasMore,
        },
      },
    });
  } catch (error) {
    console.error("Search Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getHomeFeed(req: Request, res: Response) {
  try {
    //featured polls, active Polls, voting dashboard
    //in the admin controller later add an endpoint for campaigns, for now we will settle with latest polls for hpage

    const [featuredPolls, activePolls] = await Promise.all([
       prisma.poll.findMany({
        where: {
        active: true,
        archived: false,
      },
        take: 5,
        orderBy: {
          votes: {
            _count: "desc",
          },
        },
        include: {
          _count: {
            select: { votes: true },
          },
        },
      }),
       prisma.poll.findMany({
        where: {
          active: true,
          archived:false
        },
        include:{
          category:true,

        },
        take: 6,
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);
    
    return res.status(200).json({ data:{
      featuredPolls, activePolls
    } });

  } catch (error) {
      return res.status(500).json({ error: "Internal server error" });

  }
}

export async function getVotes(req: Request, res: Response) {
  const pageLimit = 8;
  try {
    const loaded = parseInt(req.query.loaded as string) || 0 
    const {id} = req.user!;

    const [votes, count] = await Promise.all( [
      await prisma.vote.findMany({
      where:{
        userId:id,
      },
      include:{
        poll:true
      },
      take:pageLimit,
      skip:(loaded), 
      orderBy: { createdAt: "desc" },
    }),
    await prisma.vote.count({
      where:{userId:id}
    })
  ]
  );


  const hasMore = (loaded + votes.length)< count ;

    return res.status(200).json({data:
      { votes,
        count,
        pageLimit,
        hasMore,
        // currentPage: page
      }})
  } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const {id} = req.user!;
    const {image, name} =  req.body;
    if(image === null || name === null)return res.status(400).json({error:"Nothing to update"});
    let profile:Profile = {};


    if(image !== undefined)profile.image = image;
    if(name !== undefined)profile.name = name;

    if(!image && !name)return res.status(400).json({error:"Nothing to update"})

    const result = await prisma.user.update({
      where:{
        id:id
      },
      data:profile
    })

    return res.status(200).json({data:result})
  } catch (error:any) {
    console.log("error in updating", error)
      if(error.statusCode === 422 || error.code === "P2002"){
      res.status(422).json({ error: "username unavailable" });
    }
    
    return res.status(500).json({ error: "Internal server error" });    
  }
}
 export async function getCurrentUser(req: Request, res: Response){
  try {
    const {id, name, image, email} = req.user!
    return res.status(200).json({id, image, name, email})

  } catch (error) {
      return res.status(500).json({ error: "Internal server error" });   
  }
 }


export async function updateFCM(req: Request, res: Response){
  try {
    const {id} = req.user
    const {fcm} = req.body
    if(!fcm || fcm === null || fcm === "" || fcm === undefined){
      console.log("UNDEFINED")
      return res.status(400).json({error:"Bad request"}) }
    console.log("FCM Received: ", fcm)
    await prisma.user.update({
      where:{
        id:id
      },
      data:{
        userDevice:fcm
      }
  })
  res.status(200).json({message:"success"})
  } catch (error) {
      return res.status(500).json({ error: "Internal server error" });   
  }
}

export async function deleteComment(req: Request, res: Response) {
  try {
    const {id} = req.user;
    const {commentId} = req.body 

    if(commentId === null || commentId === "")return res.status(400).json({error:"Bad request"})

    //confirm if comment is from the curren user first
    await prisma.comment.delete({
      where:{
        id:commentId,
        authorId:id
      }
    })

    return res.status(200).json({ message: "Comment deleted successfully" });
  }
  catch (error) {
    console.error("Delete Comment Error:", error);
    if ((error as any).code === "P2025") {
      return res.status(404).json({ error: "Comment not found." });
    }
    return res.status(500).json({ error: "Failed to delete comment." })}
}