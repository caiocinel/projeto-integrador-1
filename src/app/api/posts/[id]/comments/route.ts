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


    const {user, content} = await req.json();


    var acc = await prisma.user.findFirst({
        where: {
            identifier: req.headers.get('X-Forwarded-For') as string,
            lastName: user
        }
    });

    if(!acc)
        acc = await prisma.user.create({
            data: {
                lastName: user,
                identifier: req.headers.get('X-Forwarded-For') as string,                
            }
        });

    await prisma.postComment.create({
        data: {
            content,
            postId: post.id,
            userId: acc.id
        }
    });
        




    return Response.json({ status: 200 });
}