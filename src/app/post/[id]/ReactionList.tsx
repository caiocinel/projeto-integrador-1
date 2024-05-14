'use client';

import { cn } from "@/lib/utils";
import { ReactionType, Reactions, User } from "@prisma/client";
import Image from "next/image";

export default function ReactionList({ logUser, postId, reactions }: { logUser: User | null, postId: number, reactions: (Reactions & ({ User: User }))[] }) {

    const handleReaction = async (reaction: ReactionType | string) => {
        const response = await fetch(`/api/posts/${postId}/reaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reaction: reaction })
        });
        if (response.ok) {
            window.location.reload();
            return alert("Reagido com sucesso");
        }


        alert("Falha na reação")        
    }
   
    return (<>
        <div className="flex justify-end">
            <div className="flex bg-white mr-4 rounded-full">{
                Object.keys(ReactionType).map((reaction, index) => {
                    return <div key={reaction} onClick={() => handleReaction(reaction)} className={cn(`flex flex-col hover:cursor-pointer items-center leading-none justify-center my-1 px-3`, Object.keys(ReactionType).length !== index+1 ? 'border-r' : '')}>
                        <Image unoptimized onMouseEnter={(e) => { e.currentTarget.src = `/react/${reaction}.gif` }} onMouseLeave={(e) => { e.currentTarget.src = `/react/${reaction}.png` }} alt={reaction} src={`/react/${reaction}.png`} width={28} height={28} />
                        <label className="text-xs">{reactions.filter(x => x.reaction == reaction).length}</label>
                    </div>
                })
            }</div>
        </div>
    </>)
}