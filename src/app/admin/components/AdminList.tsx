import { Admin, Post, PostImages, User } from "@prisma/client";
import { Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AdminList(props: { admins: Admin & { User: User }[] }) {

    if(props.admins.length == 0)
        return <p className="text-center">Nenhum administrador encontrado</p>

    return (
        <table className="rounded-lg mx-auto w-full text-center">
            <thead>
                <tr>
                    <th>Código</th>
                    <th className="w-[70%]">Usuário</th>
                    <th>Editar</th>
                </tr>
            </thead>
            <tbody>
                {props.admins.map((adm: any ) => (
                    <tr className="h-12 border-b" key={adm.id}>
                        <td>{adm.id}</td>
                        <td>{adm.username}</td>                        
                        <td><Link href={`/admin/admins/${adm.id}`}><Pencil className="mx-auto" /></Link></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
