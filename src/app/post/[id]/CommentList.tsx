'use client';

import { cn } from "@/lib/utils";
import { CommentReply, PostComment, User, } from "@prisma/client";
import { BanIcon, ReplyIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

export default function CommentList({ adm, logUser, postId, comments }: { adm: boolean, logUser: User | null, postId: number, comments: (PostComment & ({ User: User }) & ({ CommentReply: (CommentReply & ({ User: User }))[] }))[] }) {
    const [user, setUser] = useState<string>(logUser?.lastName || '');
    const [userReply, setUserReply] = useState<string>(logUser?.lastName || '');
    const [content, setContent] = useState<string>("");
    const [contentReply, setContentReply] = useState<string>("");
    const [replying, setReplying] = useState<number | null>(null);

    const handlePostComment = async () => {
        if(user == '') 
            return alert('Informe o nome');

        if(content == '')
            return alert('Informe o conteúdo do comentário');


        const response = await fetch(`/api/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user,
                content
            })
        });

        if (response.ok) {
            setContent("");
            window.location.reload();
            return alert("Comentário adicionado com sucesso");
        }

        alert("Ocorreu um erro ao adicionar o comentário");
    }

    const handleReplyComment = async () => {
        if (userReply == '')
            return alert('Informe o nome');

        if (contentReply == '')
            return alert('Informe o conteúdo do comentário');


        const response = await fetch(`/api/posts/${postId}/comments/${replying}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: userReply,
                content: contentReply
            })
        });

        if (response.ok) {
            setContent("");
            window.location.reload();
            return alert("Resposta adicionada com sucesso");
        }

        alert("Ocorreu um erro ao adicionar a resposta");
    }

    const handleDeleteComment = async (commentId: number) => {
        const response = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            window.location.reload();
            return alert("Comentário excluído com sucesso");        
        }

        alert("Ocorreu um erro ao excluir o comentário");
    }

    const handleDeleteReply = async (commentId: number, replyId: number) => {
        const response = await fetch(`/api/posts/${postId}/comments/${commentId}/reply/${replyId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            window.location.reload();
            return alert("Resposta excluída com sucesso");
        }

        alert("Ocorreu um erro ao excluir a resposta");
    }

    const banUser = async (userId: number, commentId: number) => {
        const response = await fetch(`/api/users/${userId}?comment=${comments.find(x => x.id == commentId)?.content}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            window.location.reload();
            return alert("Usuário banido com sucesso");
        }

        alert("Ocorreu um erro ao banir o usuário");
    }

    const banUserByReply = async (userId: number, commentId: number, replyId: number) => {
        const response = await fetch(`/api/users/${userId}?comment=${comments.find(x => x.id == commentId)?.CommentReply.find(x => x.id == replyId)}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            window.location.reload();
            return alert("Usuário banido com sucesso");
        }

        alert("Ocorreu um erro ao banir o usuário");
    }



    return (<>
        <div className="flex flex-col lg:w-3/4 gap-y-2">
            {
                comments.map((comment, index) => (
                    <div key={index} className="border-t border-t-zinc-300 mx-4 px-2 relative">
                        <p>{comment.content}</p>
                        <p className="text-xs">{comment.User.lastName} - {comment.createdAt.toLocaleString('pt-BR')}</p>
                        <div>
                            {
                                comment.CommentReply.map((reply, index) => (
                                    <div key={index} className="border-l border-l-zinc-300 ml-4 pl-2 relative">
                                        <p>{reply.content}</p>
                                        <p className="text-xs">{reply.User.lastName} - {reply.createdAt.toLocaleString('pt-BR')}</p>
                                        <button hidden={!adm} onClick={() => handleDeleteReply(comment.id, reply.id)} title="Excluir Resposta" className="absolute top-2 hover:text-red-500 transition right-5"><Trash2Icon width={16} /></button>
                                        <button hidden={!adm} onClick={() => banUserByReply(comment.userId, comment.id, reply.id)} title="Banir usuário" className="absolute top-2 hover:text-red-500 transition right-10"><BanIcon width={16} /></button>
                                    </div>
                                ))
                            }
                        </div>
                        <div className={cn(replying !== comment.id ? 'hidden' : 'flex flex-col gap-y-2 w-1/3 pl-4 pt-2')} >
                            <input value={userReply} onChange={(e) => setUserReply(e.target.value)} className="h-6 pl-4 rounded-lg" placeholder="Nome" />
                            <textarea value={contentReply} onChange={(e) => setContentReply(e.target.value)} className="resize-none w-full pt-2 pl-2 rounded-lg" rows={2} placeholder="Mensagem" />
                            <div className="flex justify-end gap-x-2">
                                <button onClick={() => setReplying(null)} className="bg-red-500 text-white w-20 text-xs rounded-full h-6">Cancelar</button>
                                <button onClick={() => handleReplyComment()} className="bg-blue-500 text-white w-20 text-xs rounded-full h-6">Responder</button>
                            </div>
                        </div>
                        <button hidden={!adm} onClick={() => handleDeleteComment(comment.id)} title="Excluir Comentário" className="absolute top-2 hover:text-red-500 transition right-0"><Trash2Icon width={16}/></button>
                        <button hidden={!adm} onClick={() => banUser(comment.userId, comment.id)} title="Banir usuário" className="absolute top-2 hover:text-red-500 transition right-5"><BanIcon width={16} /></button>
                        <button onClick={() => setReplying(comment.id)} title="Responder Comentário" className="absolute top-2 hover:text-green-500 transition right-10"><ReplyIcon width={16} /></button>
                    </div>
                ))
            }
            <div hidden={comments.length > 0} className="w-full text-center border-b pb-2 border-b-zinc-300">
                <p>Esse post ainda não tem nenhum comentário</p>
            </div>
            <div className={cn("flex-col gap-y-2", logUser?.blockedBy !== null ? 'hidden' : 'flex')}>
                <p>Deixe um comentário</p>
                <input value={user} onChange={(e) => setUser(e.target.value)} className="h-8 pl-4 rounded-lg" placeholder="Nome" />
                <textarea value={content} onChange={(e) => setContent(e.target.value)} className="resize-none w-full pt-4 pl-4 rounded-lg" rows={4} placeholder="Mensagem" />
                <div className="flex">
                    <button onClick={() => handlePostComment()} className="bg-blue-500 text-white w-48 rounded-full h-8 ml-auto">Postar</button>
                </div>
            </div>
        </div>
    </>)
}