import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: { id: string, commentId: string } }) {

    const adm = await prisma.admin.findFirst({
        where: {
            AdminSession: {
                some: {
                    token: cookies().get('pi_token')?.value || ''
                }
            }
        }
    })

    if (!adm)
        return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });

    try{
        await prisma.postComment.delete({
            where: {
                id: parseInt(params.commentId)
            }
        })
    }catch(e){
        return NextResponse.json({ error: "Comentário não encontrado" }, { status: 404 });
    }


    return Response.json({ status: 200 });
}