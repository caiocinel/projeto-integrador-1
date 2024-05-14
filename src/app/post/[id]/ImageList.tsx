'use client';

import { PostImages } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";

export default function ImageList({ images }: { images: PostImages[] }) {
    const [expandedImage, setExpandedImage] = useState<number>(0);



    return (<>
        <div className="p-3 rounded-l-lg">
            <Image
                className="object-cover object-center"
                src={`/uploads/${images[expandedImage].url}`}
                alt="avatar"
                width={1024}
                height={768}
            />
        </div>
        <div className="flex flex-row">
            <div className="items-center justify-between pr-2 pt-2 rounded-r-lg">
                {
                    images.map((image, index) => (
                        <div className="border items-center mb-2 rounded-lg overflow-hidden" key={index}>
                            <Image
                                className="object-contain hover:cursor-pointer"
                                src={`/uploads/${image.url}`}
                                alt="avatar"
                                width={280}
                                onClick={() => setExpandedImage(index)}
                                height={100}
                            />
                        </div>
                    ))
                }
            </div>
        </div>
    </>)
}