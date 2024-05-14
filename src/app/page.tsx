import prisma from "@/lib/prisma";
import { EyeIcon, HeartIcon, MessageCircle } from "lucide-react";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {

  const posts = await prisma.post.findMany({
    where: {
      published: true,
      Images: {
        some: {  
          id: {
            not: 0
          }       
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      Images: {
        take: 1
      },
      _count: {
        select: {
          PostComments: true,
          Reactions: true,
          PostViews: true
        }
      },
      Author: true,      
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
                Brand
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
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {posts.map((post) => (
              <Link href={`/post/${post.id}`} key={post.id}>
                <div className="w-full max-w-sm mx-auto rounded-md shadow-md overflow-hidden border">
                  <Image
                    className="w-full h-56 object-cover object-center"
                    src={`/uploads/${post.Images[0].url}`}
                    alt="avatar"
                    width={300}
                    height={200}
                  />
                  <div className="py-4 px-6 border-t">
                    <h1 title={post.title} className="text-2xl font-semibold text-gray-800">{post.title}</h1>
                    <p title={post.resume?.slice(0, 100)+'...' || ''} className="py-2 text-gray-700 overflow-hidden text-ellipsis">{post.resume}</p>
                    <div className="flex gap-x-4">
                      <div className="flex items-center"><HeartIcon width={16} height={16}/>&nbsp;{post._count.Reactions}</div>
                      <div className="flex items-center"><MessageCircle width={16} height={16} />&nbsp;{post._count.PostComments}</div>
                      <div className="flex items-center"><EyeIcon width={16} height={16} />&nbsp;{post._count.PostComments}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
