import { Post, PostImages } from "@prisma/client";
import { Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function PostList(props: { posts: Post & { Images: PostImages[] }[] }) {

    if(props.posts.length == 0)
        return <p className="text-center">Nenhum post encontrado</p>

    return (
        <table className="rounded-lg mx-auto w-full text-center">
            <thead>
                <tr>
                    <th className="w-[5%]">Código</th>
                    <th className="w-[30%]">Título</th>
                    <th className="w-[30%]">Resumo</th>
                    <th className="w-[30%]">Postado Em</th>                    
                    <th className="w-[5%]">Editar</th>
                </tr>
            </thead>
            <tbody>
                {props.posts.map((post: any ) => (
                    <tr className="h-12 border-b" key={post.id}>
                        <td>{post.id}</td>
                        <td>{post.title}</td>
                        <td className="whitespace-nowrap overflow-hidden overflow-ellipsis">{post.resume}</td>
                        <td>{post.createdAt.toLocaleString()}</td>
                        <td><Link href={`/admin/posts/${post.id}`}><Pencil className="mx-auto" /></Link></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
