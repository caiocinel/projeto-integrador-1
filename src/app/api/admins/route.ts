import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

    const login = await prisma.admin.findFirst({
        where: {
            AdminSession: {
                some: {
                    token: cookies().get('pi_token')?.value || ''
                }
            }
        }
    })

    if (!login)
        return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 })

    const adm = await prisma.admin.create({
        data: {
            username: 'Novo Usuário '+ Math.random().toString(36).substring(3),
            password: '4d218421d982d18d91d129842112',            
        },        
    });


    return Response.redirect(process.env.BASE_URL + '/admin/admins/' + adm.id);
}

export async function POST(req: NextRequest) {

    const data = await req.json();

    if(!data.username || !data.password)
        return Response.json({error: 'Usuário e senha são obrigatórios'}, {status: 400});

    const adm = await prisma.admin.findUnique({
        where: {
            username: data.username
        }
    })

    if(!adm || (adm.password !== data.password))
        return Response.json({error: 'Usuário ou senha inválidos'}, {status: 400});


    const session = await prisma.adminSession.create({
        data: {
            adminId: adm.id            
        }
    });


    return Response.json({session: session.token});    
}