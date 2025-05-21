'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button';
import { z } from 'zod'
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "sonner"
import useAuthentication from '@/hooks/useAuthentication';
import { Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
    email: z.string().email({ message: "Please provide a correct email format." }),
    password: z.string().min(6, { message: "Password must be 6 characters long." }).max(50, { message: "Password must not exceed 50 characters." })
})

const SignIn = () => {
    const router = useRouter()
    const { loading, signInCall, googlePopUp } = useAuthentication();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    })

    const googleSignIn = async () => {
        const error: null | any = await googlePopUp();
        if (error != null) {
            // if (error?.code == "auth/invalid-credential") {
            //     toast.error('Invalid Credentials', {
            //         description: 'Please enter correct email and password'
            //     })
            // }
            return
        }
        toast.success('Signed in successfully !', {
            description: 'Redirecting to dashboard.'
        })
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const error: null | any = await signInCall(values.email, values.password);
        if (error != null) {
            if (error?.code == "auth/invalid-credential") {
                toast.error('Invalid Credentials', {
                    description: 'Please enter correct email and password'
                })
            }
            return
        }
        toast.success('Signed in successfully !', {
            description: 'Redirecting to dashboard.'
        })

    }

    return (
        <div className='flex items-center justify-center min-h-screen text-center'>
            <div className='w-[400px]'>
                <Card className='flex flex-col'>
                    <CardHeader>
                        <CardTitle className='text-2xl'>Welcome Back !</CardTitle>
                    </CardHeader>
                    <CardContent className='flex flex-col gap-4'>
                        <Button variant="outline" onClick={googleSignIn} className="w-full">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path
                                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                    fill="currentColor"
                                />
                            </svg>
                            Google
                        </Button>
                        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                            <span className="relative z-10 bg-background px-2 text-muted-foreground">
                                Or continue with
                            </span>
                        </div>
                        <Form {...form} >
                            <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
                                <FormField
                                    control={form.control}
                                    name='email'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder='example@gmail.com' />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='password'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <p className='text-sm'>Forgot Password ?</p>
                                <div className='flex items-center justify-center'>
                                    <Button disabled={loading}>{loading ? (<><Loader2 className="animate-spin" /> <span>Please wait</span></>) : "Sign Up"}</Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className='flex justify-center'>
                        <div className="text-center text-sm">
                            Don't have an account?{" "}
                            <a href="/signup" className="underline underline-offset-4">
                                Sign up
                            </a>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}

export default SignIn