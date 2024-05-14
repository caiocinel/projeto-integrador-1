import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { id: string, commentId: string } }) {
    const comment = await prisma.postComment.findUnique({
        where: {
            id: parseInt(params.commentId)
        }
    })

    if (!comment)
        return Response.json({ error: 'Comentário não encontrado' }, { status: 404 });


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

    await prisma.commentReply.create({
        data: {
            content,
            commentId: comment.id,
            userId: acc.id
        }
    });     

    return Response.json({ok: false}, { status: 200 });
}