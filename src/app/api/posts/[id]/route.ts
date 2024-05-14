import prisma from "@/lib/prisma";
import { writeFile } from "fs/promises";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const post = await prisma.post.findUnique({
        where: {
            id: parseInt(params.id)
        },
        include: {
            Images: true,
            Author: true,
            PostComments: true,
            Reactions: true
        }
    });


    if (post === null)
        return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });


    return NextResponse.json(post)
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

    const post = await prisma.post.findUnique({
        where: {
            id: parseInt(params.id)
        }
    })

    if (post === null)
        return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });

    await prisma.postImages.deleteMany({
        where: {
            postId: parseInt(params.id)
        }
    })

    await prisma.postComment.deleteMany({
        where: {
            postId: parseInt(params.id)
        }
    })

    await prisma.reactions.deleteMany({
        where: {
            postId: parseInt(params.id)
        }
    })

    await prisma.post.delete({
        where: {
            id: parseInt(params.id)
        }
    })

    return NextResponse.json({ message: 'Post excluído com sucesso' }, { status: 200 });
}


export async function POST(req: NextRequest, { params }: { params: { id: string } }) {

    const post = await prisma.post.findUnique({
        where: {
            id: parseInt(params.id)
        }
    })


    if (post === null)
        return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });

    const formData = await req.formData();

    await prisma.post.update({
        where: {
            id: parseInt(params.id)
        },
        data: {
            title: formData.get('title') as string,
            content: formData.get('content') as string,
            published: formData.get('published') === 'true' ? true : false,
            resume: formData.get('resume') as string,
            Images: {
                deleteMany: {
                    url: {
                        notIn: formData.getAll('image').map((image) => {
                            return (image as string).replace('/uploads/', '')
                        })
                    }
                },
            }
        }
    })


    const file = formData.getAll("newImage") as File[];

    if (file.length > 0) {
        const imageRet: (string | false)[] = await Promise.all(file.map(async (file: any) => {
            const buffer = Buffer.from(await file.arrayBuffer());
            const filename = Date.now() + file.name.replaceAll(" ", "_");
            console.log(filename);
            try {
                await writeFile(
                    path.join(process.cwd(), "public/uploads/" + filename),
                    buffer
                );
                return filename;
            } catch (error) {
                console.log("Error occured ", error);
                return false;
            }
        }))

        if (imageRet.filter(x => x === false).length > 1) {
            return NextResponse.json({ error: 'Erro ao salvar imagem' }, { status: 500 });
        }

        await prisma.postImages.createMany({
            data: imageRet.map((image) => {
                return { url: image.toString(), postId: parseInt(params.id) }
            })
        })
    }
    return NextResponse.json({ message: 'Post salvo com sucesso' }, { status: 200 });
}