import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: { id: string, commentId: string, replyId: string } }) {
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

    try {
        await prisma.commentReply.delete({
            where: {
                id: parseInt(params.replyId)
            }
        })
    } catch (e) {
        return NextResponse.json({ error: "Resposta não encontrada" }, { status: 404 });
    }


    return Response.json({ status: 200 });
}
