import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import prisma from "@/lib/prisma";
import PostList from "./components/PostList";
import Link from "next/link";
import { NewPost } from "./components/NewPost";
import BanList from "./components/BanList";
import AdminList from "./components/AdminList";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {

    const adm = await prisma.admin.findFirst({
        where: {
            AdminSession: {
                some: {
                    token: cookies().get('pi_token')?.value || ''
                }
            }
        }
    })

    if(!adm)
        redirect('/admin/login')

    const posts = await prisma.post.findMany({
        orderBy: {
            createdAt: "desc"
        },
        take: 10,
        select: {
            id: true,
            title: true,
            resume: true,
            Author: {
                select: {
                    username: true
                }
            },
            createdAt: true,
            Images: {
                take: 1,
                orderBy: {
                    id: 'asc'
                }
            },
            published: true
        }
    });

    const blockedUsers = await prisma.user.findMany({
        where: {
            blockedBy: {
                not: null            
            }
        },
        distinct: ['identifier'],
        include: {
            CommentReply: {
                where: {
                    User: {
                        blockedBy: null
                    }
                }
            }
        }
    });

    const admins = await prisma.admin.findMany({
        omit: {
            password: true
        }
    });

    return (
        <div className="flex">
            <div className="border-2 rounded-lg mx-auto mt-8">
                <Tabs defaultValue="posts" className="w-[1024px]">
                    <TabsList>
                        <TabsTrigger value="posts">Postagens</TabsTrigger>
                        <TabsTrigger value="newPost">Novo Post</TabsTrigger>
                        <TabsTrigger value="userBlock">Usuários Bloqueados</TabsTrigger>
                        <TabsTrigger value="admins">Administradores</TabsTrigger>
                    </TabsList>
                    <TabsContent value="posts" className="mx-4">
                        {/* @ts-ignore */}
                        <PostList posts={posts} />
                    </TabsContent>
                    <TabsContent value="newPost">
                        <NewPost />
                    </TabsContent>
                    <TabsContent value="userBlock">                        
                        <BanList users={blockedUsers} />
                    </TabsContent>
                    <TabsContent value="admins">
                        {/* @ts-ignore */}
                        <AdminList admins={admins} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>            
    );
}
