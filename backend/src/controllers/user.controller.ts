import type { Request, Response } from "express";

import { prisma } from "../lib/db";
import { error } from "node:console";

interface Profile{
  image?:string;
  name?:string
}

const weights = {
  FREE: 1,
  BASIC: 30,
  PREMIUM: 80,
};

export async function registerVote(req: Request, res: Response) {
  const basic = 15;
  const premium = 100;
  try {
    //use xendit here or stripe or whatever payment api, Ill implement later.
    const requiredFields = ["tier", "pollId", "optionId"];
    const { deviceId, tier, pollId, optionId } = req.body;
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

    if (tier.toUpperCase() === "FREE") {
      if (!deviceId)
        return res.status(400).json({ error: "Device ID missing" });
      else {
        const isVoteExisting = await prisma.vote.findFirst({
          where: {
            deviceId: deviceId,
            tier: "FREE",
            pollId: pollId,
          },
        });
        if (isVoteExisting)
          return res
            .status(403)
            .json({ error: "Only one free vote at a time" });
        else {
          const vote = await prisma.vote.create({
            data: {
              deviceId: deviceId,
              tier: "FREE",
              weight: weights.FREE,
              poll: {
                connect: { id: pollId },
              },
              option: {
                connect: { id: optionId },
              },
              user: {
                connect: { id: user.id },
              },
              //   Think of it like a shortcut for an if statement inside an object > see &&
              // ...(user && {
              //   user: {
              //     connect: { id: user.id },
              //   },
              // }),
            },
          });
          return res.status(200).json({
            data: vote,
          });
        }
      }
    } else if (
      tier.toUpperCase() === "BASIC" ||
      tier.toUpperCase() === "PREMIUM"
    ) {
      //try here the xendit or other
      //create invoice, create order later via webhook if success.
      const invoice = await prisma.invoice.create({
        data: {
          amount: 0.0,
          user: {
            connect: { id: user.id },
          },
          poll: {
            connect: { id: pollId },
          },
          tier: tier.toUpperCase(),
        },
      });
      return res.status(200).json({ data: invoice });
    }
    //if device ID is on the list and it's free tier, intercept.
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function addComment(req: Request, res: Response) {
  try {
    const { id, name } = req.user;
    const { text, pollId } = req.body;
    // return res.status(200).json({id, user:name})
    if (!text || !pollId)
      return res.status(400).json({ error: "Required fields missing" });
    const comment = await prisma.comment.create({
      data: {
        text,
        poll: { connect: { id: pollId } },
        author: { connect: { id: id } },
      },
    });

    return res.status(200).json({ data: comment });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getPollComments(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

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

    const hasMore = skip + comments.length < totalCount;

    return res.status(200).json({
      comments,
      pagination: {
        totalCount,
        currentPage: page,
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
    const { searchQuery, page = "1", limit = "10" } = req.query;

    if (!searchQuery) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const p = parseInt(page as string) || 1;
    const l = parseInt(limit as string) || 10;
    const skip = (p - 1) * l;

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
        take: l,
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

    const hasMore = skip + polls.length < totalCount;

    return res.status(200).json({
      data: {
        polls,
        pagination: {
          totalCount,
          currentPage: p,
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

//Show more, I didn't check with ai for this so might break or not the standard?
export async function getVotes(req: Request, res: Response) {
  const pageLimit = 4;
  try {
    const loaded = parseInt(req.query.loaded as string) || 0 
    const {id} = req.user;

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
    const {id} = req.user;
    const {image, name} =  req.body;
    if(!image || !name)return res.status(400).json({error:"Nothing to return"});
    let profile:Profile = {};


    if(image)profile.image = image;
    if(name)profile.name = name;

    const result = await prisma.user.update({
      where:{
        id:id
      },
      data:profile
    })

    return res.status(200).json({data:result})
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });    
  }
}


