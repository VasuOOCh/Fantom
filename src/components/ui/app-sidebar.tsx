'use client'
import React, { useEffect } from 'react'
import { Plus, GaugeIcon, Youtube, GalleryVerticalEnd, Files, Wrench, ChevronUp, UserRound, Settings, LogOut } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './sidebar'
import { ModeToggle } from './theme-toggle';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './dropdown-menu';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import Image from 'next/image';
import useAuthentication from '@/hooks/useAuthentication';
import { useRouter } from 'next/navigation';

const interviewMenu = [
    {
        title: "Mock Interview",
        url: "/interview",
        icon: Plus
    },
    {
        title: "All Interviews",
        url: "#",
        icon: GalleryVerticalEnd
    },
    {
        title: "Online Interviews",
        url: "#",
        icon: Youtube
    },

]

const toolsMenu = [
    {
        title: "Manage Resumes",
        url: "/resume",
        icon: Files
    },
    {
        title: "Resume Builder",
        url: "#",
        icon: Wrench
    },
]

const AppSidebar = () => {
    // const router = useRouter();
    const user = useSelector((state: RootState) => state.auth.user);
    const { signOutCall } = useAuthentication()
    if (!user) return null;

    return (
        <Sidebar>
            <SidebarHeader className='flex items-center flex-row justify-between'>
                <SidebarMenu>
                    <SidebarMenuItem >
                        <a href="#" className='flex flex-row justify-between items-center'>
                            <h1>Interview app</h1>
                            {/* <Theme */}
                            <ModeToggle />
                        </a>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>

                <SidebarGroup>
                    <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <a href="/dashboard">
                                        <GaugeIcon size={32} />
                                        <span>Dashboard</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup >
                    <SidebarGroupLabel>Interview</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {
                                interviewMenu.map((item, index) => (
                                    <SidebarMenuItem key={index}>
                                        <SidebarMenuButton asChild>
                                            <a href={item.url} className='flex gap-4 items-center'>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                            }
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup >
                    <SidebarGroupLabel>Tools</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {
                                toolsMenu.map((item, index) => (
                                    <SidebarMenuItem key={index}>
                                        <SidebarMenuButton asChild>
                                            <a href={item.url} className='flex gap-4 items-center'>
                                                <item.icon className='' />
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                            }
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu className='pb-8'>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className='flex items-center'>
                                    <Image src={user.avatar || '/avatar.jpg'} width={30} height={30} className='object-cover rounded-full' alt='user img' />
                                    <span>{user.name || "DEFAULT_USER"}</span>
                                    <ChevronUp className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className='w-full' side='top'>
                                <DropdownMenuItem>
                                    <UserRound />
                                    <span>Account</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings />
                                    <span>Setting</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={signOutCall}>
                                    <LogOut />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}

export default AppSidebar