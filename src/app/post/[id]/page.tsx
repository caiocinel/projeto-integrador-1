import prisma from "@/lib/prisma";
import { EyeIcon, HeartIcon, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ImageList from "./ImageList";
import CommentList from "./CommentList";
import { cookies, headers } from "next/headers";
import ReactionList from "./ReactionList";

export default async function Home({ params }: { params: { id: string } }) {

    const post = await prisma.post.findUnique({
        where: {
            id: parseInt(params.id)
        },
        include: {
            Author: true,
            Images: true,
            PostComments: {
                include: {
                    User: true,
                    CommentReply: {
                        include: {
                            User: true
                        }
                    }
                },
                where: {
                    User: {
                        blockedBy: null
                    }
                }
            },
            PostViews: true,
            Reactions: {
                include: {
                    User: true
                }
            }
        }
    })

    if (!post)
        return { notFound: true }

    var user = await prisma.user.findFirst({
        where: {
            identifier: headers().get('X-Forwarded-For') as string,
        },
        orderBy: {
            blockedBy: 'desc'
        }
    })

    if (!user)
        user = await prisma.user.create({
            data: {
                identifier: headers().get('X-Forwarded-For') as string,
            }
        });

    await prisma.postViews.upsert({
        where: {
            postId_userId: {
                postId: post.id,
                userId: user.id
            }
        },
        create: {
            postId: post.id,
            userId: user.id
        },
        update: {
            id: undefined
        }
    });

    const adm = await prisma.admin.findFirst({
        where: {
            AdminSession: {
                some: {
                    token: cookies().get('pi_token')?.value || ''
                }
            }
        }
    })



return (
    <>
        <header>
            <div className="bg-gray-800">
                <div className="container mx-auto px-6 py-3">
                    <div className="flex items-center justify-between">
                        <div className="w-full text-gray-100 text-2xl font-semibold">
                            Studio Nanna Guiraldelli
                        </div>
                        <button className="w-full text-gray-100 text-xs font-semibold">
                            <Link href={'/admin'} hidden={adm === null}>Gereciar</Link>
                        </button>
                    </div>
                </div>
            </div>
        </header>
        <main>
            <div className="container mx-auto px-6 py-6">
                <h1 className="border-b border-black text-2xl font-bold">{post?.title}</h1>
                <div className="flex justify-between">
                    <p className="text-sm">{post?.resume}</p>
                    <p className="text-sm">{post?.createdAt.toLocaleString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</p>
                </div>
                <main className="bg-slate-100 flex flex-col gap-y-4">
                    <div className="flex p-2 overflow-hidden">
                        <ImageList images={post.Images} />
                    </div>
                    <div className="border-t border-t-zinc-400 mx-4">
                        <p className="text-lg whitespace-pre-wrap p-2" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: post.content  || ''}}></p>
                    </div>                    
                    <ReactionList logUser={user} postId={post.id} reactions={post.Reactions} />
                    <div className="mx-4 border-t border-t-zinc-300 mb-8">
                        <h1 className="text-xl">Comentários</h1>
                        <div className="lg:flex gap-x-4">
                            <CommentList adm={adm !== null} logUser={user} postId={post.id} comments={post.PostComments} />
                            <div className="flex flex-col lg:w-1/4 gap-y-1">
                                <div>
                                    <p>Autor</p>
                                    <p>{post.Author.username}</p>
                                </div>
                                <hr />
                                <div>
                                    <p>Publicado em</p>
                                    <p>{post.createdAt.toLocaleString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}</p>
                                </div>
                                <hr />
                                <div>
                                    <p>Estatísticas</p>
                                    <div className="flex gap-x-4">
                                        <div className="flex items-center"><HeartIcon width={16} height={16} />&nbsp;{post.Reactions.length}</div>
                                        <div className="flex items-center"><MessageCircle width={16} height={16} />&nbsp;{post.PostComments.length}</div>
                                        <div className="flex items-center"><EyeIcon width={16} height={16} />&nbsp;{post.PostViews.length}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </main>
    </>
);
}
