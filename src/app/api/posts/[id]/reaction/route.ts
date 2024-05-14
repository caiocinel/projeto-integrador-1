import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const post = await prisma.post.findUnique({
        where: {
            id: parseInt(params.id)
        }
    })

    if(!post)
        return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });


    const { reaction } = await req.json();


    var acc = await prisma.user.findFirst({
        where: {
            identifier: req.headers.get('X-Forwarded-For') as string
        }
    });

    if(!acc)
        acc = await prisma.user.create({
            data: {
                identifier: req.headers.get('X-Forwarded-For') as string,                
            }
        });


    await prisma.reactions.upsert({
        where: {
            postId_userId: {
                postId: post.id,
                userId: acc.id            
            }
        },
        update: {
            reaction: reaction
        },
        create: {
            reaction: reaction,
            postId: post.id,
            userId: acc.id
        }
    });
        




    return Response.json({ok: true},{ status: 200 });
}