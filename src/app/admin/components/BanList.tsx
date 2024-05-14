'use client';

import { UserMinusIcon } from "lucide-react";


type TUsers = ({
    blockedBy: string | null;
} & {
    id: number;
    identifier: string;
    lastName: string | null;
    adminId: number | null;
})


export default function BanList(props: { users: TUsers[] }) {

    const unban = async (id: number) => {
        const response = await fetch(`/api/users/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (response.status == 200){
            window.location.reload();
            return alert('Usuário desbloqueado com sucesso');
        }

        alert('Erro ao desbloquear usuário');
    }


    if (props.users.length == 0)
        return <p className="text-center">Nenhum usuário encontrado</p>
        
    return (
        <table className="rounded-lg mx-auto w-full text-center">
            <thead>
                <tr>
                    <th className="w-[30%]">Nome</th>
                    <th className="w-[60%]">Comentário</th>
                    <th className="w-[10%]">Desbanir</th>
                </tr>
            </thead>
            <tbody>
                {props.users.map((user: TUsers ) => (
                    <tr className="h-12 border-b" key={user.id}>
                        <td>{user.lastName}</td>
                        <td className="whitespace-nowrap overflow-hidden overflow-ellipsis">{user.blockedBy}</td>
                        <td><button onClick={() => unban(user.id)}><UserMinusIcon className="mx-auto" /></button></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
