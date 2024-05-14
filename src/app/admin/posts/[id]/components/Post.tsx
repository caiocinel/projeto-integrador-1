'use client';

import { Switch } from "@/components/ui/switch";
import { Admin, PostComment, PostImages, Post as PrismaPost, Reactions } from "@prisma/client";
import { UpdateIcon } from "@radix-ui/react-icons";
import { PlusIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import dynamic from 'next/dynamic';
import { useState } from "react";
import ImageUploading from 'react-images-uploading';
import { ContentState, EditorState, convertFromHTML, convertToRaw } from 'draft-js';
const Editor = dynamic(() => import('react-draft-wysiwyg').then(mod => mod.Editor), { ssr: false });
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

export default function Post(props: { data: PrismaPost & { Images: PostImages[]; PostComments: PostComment[]; Reactions: Reactions[]; Author: Admin; } }) {
    const [title, setTitle] = useState(props.data.title);
    const [resume, setResume] = useState(props.data.resume);
    const [editorState, setEditorState] = useState<EditorState>(EditorState.createWithContent(
        ContentState.createFromBlockArray(
            htmlToDraft(props.data.content || '').contentBlocks || []
        )
    ),);
    const [published, setPublished] = useState(props.data.published || false);
    const [images, setImages] = useState<any[]>(props.data.Images.map((image) => ({ data_url: '/uploads/' + image.url, file: 0 })));

    const doDelete = async () => {
        const response = await fetch('/api/posts/' + props.data.id, {
            method: 'DELETE',
        });

        if (response.status === 200) {
            alert("Excluído com sucesso")
            return window.location.reload();
        }

        const error = await response.json();
        alert(error.error);
    }


    const doUpload = async () => {

        if (title.trim() === '')
            return alert('Informe o título do post');

        if (images.length === 0)
            return alert('Escolha ao menos uma imagem');

        if (resume.trim() === '')
            return alert('Informe o resumo do post');



        const formData = new FormData();
        formData.append('title', title);
        formData.append('resume', resume);
        formData.append('content', draftToHtml(convertToRaw(editorState.getCurrentContent())));
        formData.append('published', published.toString());
        images.filter(x => x.file !== 0).forEach((image: any) => {
            formData.append('newImage', image.file);
        });

        images.filter(x => x.file === 0).forEach((image: any) => {
            formData.append('image', image.data_url);
        })



        const response = await fetch('/api/posts/' + props.data.id, {
            method: 'POST',
            body: formData,
        });

        if (response.status === 200) {
            alert("Cadastrado com sucesso")
            return window.location.reload();
        }

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
                <label htmlFor="resume">Resumo</label>
                <input type="text" id="resume" onChange={(e) => setResume(e.target.value)} value={resume} className="border-2 transition focus:outline-blue-500 rounded-lg p-2" />
            </div>
            <div className="flex flex-col p-4">
                <label htmlFor="content">Conteúdo</label>
                {/* <textarea id="content" onChange={(e) => setContent(e.target.value)} rows={10} value={content} className="border-2 transition focus:outline-blue-500 rounded-lg p-2"></textarea> */}
                <Editor
                    editorState={editorState}
                    onEditorStateChange={(e) => setEditorState(e)}
                    wrapperClassName="wrapper-class"
                    localization={{ locale: 'pt' }}
                    editorClassName="editor-class"
                    toolbarClassName="toolbar-class"                    
                />
            </div>
            <div className="flex p-4 gap-x-2 items-center">                
                <Switch checked={published} onCheckedChange={(e) => setPublished(e)} id="airplane-mode" />
                <label htmlFor="airplane-mode">Visível ao público</label>
            </div>
            <p hidden={images.length > 0} className="text-red-500">Esse post não ficará visível enquanto não tiver uma imagem</p>

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
                                    <Image src={image['data_url']} alt="" width="148" height="148" />
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
                <button onClick={() => doDelete()} className="bg-red-500 text-white p-2 ml-auto px-10 rounded-lg">Excluir</button>
            </div>
        </div>
    );
}