"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cookies } from "next/headers"
import { setCookie } from 'cookies-next';
import { useRouter } from "next/navigation"

const formSchema = z.object({
    username: z.string({required_error: "Digite o usuário"}),
    password: z.string({required_error: "Digite a senha"})
})

export default function ProfileForm() {

    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const req = await fetch("/api/admins", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
        });


        if (req.status === 400) {
            const data = await req.json()
            form.setError("username", { message: data.error })
            return
        }

        const data = await req.json();

        setCookie('pi_token', data.session, {
            maxAge: 30 * 24 * 60 * 60,
            path: '/',
        });
        router.push('/admin')
    }

    return (
        <div className="h-screen w-full flex justify-center items-center bg-zinc-200">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 bg-white p-8 rounded-lg shadow-lg">
                    <FormField
                        control={form.control}
                        name="username"                        
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Usuário</FormLabel>
                                <FormControl>
                                    <Input placeholder="Usuário" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Senha</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="Senha" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit">Entrar</Button>
                </form>
            </Form>
        </div>
    )
}
