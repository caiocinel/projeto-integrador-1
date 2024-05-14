import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {

    const user = await prisma.user.findFirst({
        where: {
            id: parseInt(params.id)
        }
    })

    if(!user)
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    if(user.adminId !== null)
        return NextResponse.json({ error: "Você não pode banir um administrador" }, { status: 400 });   

    await prisma.user.updateMany({
        where: {
            identifier: user.identifier
        },
        data: {
            blockedBy: req.nextUrl.searchParams.get('comment')
        }
    });  

    return Response.json({ status: 200 });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {

    const user = await prisma.user.findFirst({
        where: {
            id: parseInt(params.id)
        }
    })

    if (!user)
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    await prisma.user.updateMany({
        where: {
            identifier: user.identifier
        },
        data: {
            blockedBy: null
        }
    });

    return Response.json({ status: 200 });
}



