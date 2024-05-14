import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {

    const adm = await prisma.admin.findFirst({
        where: {
            id: parseInt(params.id)
        }
    })

    if (!adm)
        return NextResponse.json({ error: "Administrador não encontrado" }, { status: 404 });


    const formdata = await req.formData()
    const password = formdata.get('pass')?.toString() || ''
    const user = formdata.get('user')?.toString() || ''

    await prisma.admin.updateMany({
        where: {
            id: parseInt(params.id)
        },
        data: {
            password: password === null || password === '' ? undefined : password,
            username: user === null || user === '' ? undefined : user
        }
    });  

    return Response.json({ status: 200 });
}


export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {

    const adm = await prisma.admin.findFirst({
        where: {
            id: parseInt(params.id)
        }
    })

    if (!adm)
        return NextResponse.json({ error: "Administrador não encontrado" }, { status: 404 });

    await prisma.admin.delete({
        where: {
            id: parseInt(params.id)
        }
    });

    return Response.json({ status: 200 });
}