'use client';

import { Admin as PrismaAdmin } from "@prisma/client";
import { useState } from "react";


export default function Post(props: { data: PrismaAdmin }) {
    const [user, setUser] = useState(props.data.username);
    const [pass, setPass] = useState('');


    const doDelete = async () => {
        if (!confirm('Deseja realmente excluir este administrador? Todos os posts realizados por ele também serão excluidos'))
            return

        const response = await fetch('/api/admins/' + props.data.id, {
            method: 'DELETE',
        });

        if (response.status === 200) {
            alert("Excluído com sucesso")
            window.location.href = '/admin';   
            return;         
        }        

        alert("Algo deu errado durante a exclusão");
    }

    const doUpdate = async () => {


        if ((user.trim() === '') && (pass.trim() === ''))
            return        

        const formData = new FormData();
        formData.append('user', user);
        formData.append('pass', pass);



        const response = await fetch('/api/admins/' + props.data.id, {
            method: 'PATCH',
            body: formData,
        });

        if (response.status === 200) {
            alert("Atualizado com sucesso")
            return window.location.reload();
        }

        const error = await response.json();
        alert(error.error);
    }


    return (
        <div>
            <div className="flex flex-col p-4">
                <label htmlFor="title">Usuário</label>  
                <input type="text" id="title" onChange={(e) => setUser(e.target.value)} value={user} className="border-2 transition focus:outline-blue-500 rounded-lg p-2" />
            </div>
            <div className="flex flex-col p-4">
                <label htmlFor="resume">Senha</label>
                <input type="password" id="resume" onChange={(e) => setPass(e.target.value)} value={pass} className="border-2 transition focus:outline-blue-500 rounded-lg p-2" />
            </div>            
            
            <div className="flex p-4">
                <button onClick={() => doUpdate()} className="bg-blue-500 text-white p-2 px-10 rounded-lg">Salvar</button>
                <button onClick={() => doDelete()} className="bg-red-500 ml-auto text-white p-2 px-10 rounded-lg">Excluir</button>
            </div>
        </div>
    );
}