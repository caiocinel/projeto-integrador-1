'use client';


import { useState } from "react";
import ImageUploading from 'react-images-uploading';
import { PlusIcon, Trash, Trash2 } from 'lucide-react'
import { UpdateIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";

export function NewPost() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [resume, setResume] = useState('');
    const [content, setContent] = useState('');    
    const [images, setImages] = useState([]);


    const doUpload = async () => {

        if(title.trim() === '')
            return alert('Informe o título do post');

        if(images.length === 0)
            return alert('Escolha ao menos uma imagem');

        if(resume.trim() === '')
            return alert('Informe o resumo do post');
       


        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('resume', resume);
        images.forEach((image: any) => {
            formData.append('images', image.file);
        });

        const response = await fetch('/api/posts', {
            method: 'POST',
            body: formData,
        });

        if(response.status === 201)
            return alert("Cadastrado com sucesso")//router.push('/admin/posts?id=' + (await response.json()).id);

        const error = await response.json();
        alert(error.error);
    }

     
    return (
        <div>
            <div className="flex flex-col p-4">
                <label htmlFor="title">Título</label>
                <input type="text" id="title" onChange={(e) => setTitle(e.target.value)} value={title} className="border-2 transition focus:outline-blue-500 rounded-lg p-2" />
            </div>
            <div className="flex flex-col p-4">
                <label htmlFor="title">Resumo</label>
                <input type="text" id="title" onChange={(e) => setResume(e.target.value)} value={resume} className="border-2 transition focus:outline-blue-500 rounded-lg p-2" />
            </div>
            <div className="flex flex-col p-4">
                <label htmlFor="content">Conteúdo</label>
                <textarea id="content" onChange={(e) => setContent(e.target.value)} rows={10} value={content} className="border-2 transition focus:outline-blue-500 rounded-lg p-2"></textarea>
            </div>
            <div className="p-4">
                <ImageUploading
                    multiple
                    value={images}
                    onChange={(e) => setImages(e as any)}                    
                    dataURLKey="data_url"
                >
                    {({
                        imageList,
                        onImageUpload,
                        onImageUpdate,
                        onImageRemove,
                        isDragging,
                        dragProps,
                    }) => (
                        <div className="flex gap-x-4">
                            {imageList.map((image, index) => (
                                <div key={index} className="image-item">
                                    <img src={image['data_url']} alt="" width="148" height="148" />
                                    <div className="flex h-8">
                                        <button className="bg-zinc-200 w-full" onClick={() => onImageUpdate(index)}><UpdateIcon className="mx-auto" width={24} height={24} /></button>
                                        <button className="bg-zinc-200 w-full" onClick={() => onImageRemove(index)}><Trash2 className="mx-auto" width={24} height={24} /></button>
                                    </div>
                                </div>
                            ))}                            
                            <button
                                style={isDragging ? { color: 'red' } : undefined}
                                onClick={onImageUpload}{...dragProps}
                                className="bg-zinc-200 w-36 h-36     text-center rounded"
                                >
                                <PlusIcon width={64} height={64} color="gray" className="mx-auto" />
                            </button>                            
                        </div>
                    )}
                </ImageUploading>

            </div>
            <div className="flex p-4">
                <button onClick={() => doUpload()} className="bg-blue-500 text-white p-2 px-10 rounded-lg">Salvar</button>
            </div>
        </div>
    );
}