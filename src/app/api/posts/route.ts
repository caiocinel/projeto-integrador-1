import prisma from "@/lib/prisma";
import { writeFile } from "fs/promises";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export const POST = async (req: NextRequest) => {
    
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
        return NextResponse.json({error: 'Usuário não autenticado'}, {status: 401})


    const formData = await req.formData();

    const title = formData.get("title") as string | null;
    const content = formData.get("content") as string | null;
    const images = formData.getAll("images");    
    const resume = formData.get("resume") as string | null;

    if(title === null || title.toString().trim() === '')
        return NextResponse.json({error: 'Informe o título do post'}, {status: 400});        


    if(resume === null || resume.trim() === '')
        return NextResponse.json({error: 'Informe o resumo do post'}, {status: 400});


    if(images.length === 0)
        return NextResponse.json({error: 'Escolha ao menos uma imagem'}, {status: 400});    

    const file = formData.getAll("images") as File[];

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

    if(imageRet.filter(x => x === false).length > 1){
        return NextResponse.json({error: 'Erro ao salvar imagem'}, {status: 500});
    }
    
    const id = await prisma.post.create({
        data: {
            title: title.toString(),
            authorId: 1,
            content: content ? content : null,
            resume: resume,
            published: true,
            Images: {
                createMany: {
                    data: imageRet.map((image) => {
                        return { url: image.toString() }
                    })
                }
            }
        },
        select: {
            id: true
        }
    })

    return NextResponse.json({message: 'Post salvo com sucesso', id: id.id}, {status: 201});
};