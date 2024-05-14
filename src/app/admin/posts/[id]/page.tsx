import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import prisma from "@/lib/prisma";
import PostList from "../../components/PostList";
import { NewPost } from "../../components/NewPost";
import Link from "next/link";
import Post from "./components/Post";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function Home({ params }: { params: { id: string } }) {

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
        redirect('/admin/login')

    const data = await prisma.post.findUnique({
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

    if(data === null)
        redirect('/admin');

    return (
        <div className="flex">
            <div className="border-2 rounded-lg mx-auto mt-8">
                <Tabs defaultValue="editPost" className="w-[1024px]">
                    <TabsList>
                        <Link href={'/admin'} >
                            <button className={"inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"}>
                                Postagens
                            </button>
                        </Link>
                        <TabsTrigger value="editPost">Editar Post</TabsTrigger>
                    </TabsList>
                    <TabsContent value="editPost">
                        {/* @ts-ignore */}
                        <Post data={data} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>            
    );
}
