import React from 'react'
import { Plus, GaugeIcon, Youtube, GalleryVerticalEnd, Files, Wrench } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './sidebar'
import { ModeToggle } from './theme-toggle';

const interviewMenu = [
    {
        title: "Mock Interview",
        url: "#",
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
        url: "#",
        icon: Files
    },
    {
        title: "Resume Builder",
        url: "#",
        icon: Wrench
    },
]

const AppSidebar = () => {
    return (
        <Sidebar>
            <SidebarHeader className='flex items-center flex-row justify-between'>
                <h1>Interview app</h1>
                {/* <Theme */}
                <ModeToggle />
            </SidebarHeader>
            <SidebarContent>

                <SidebarGroup>
                    <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <a href="#">
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
                                        <SidebarMenuButton isActive={index == 0} asChild>
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

                <SidebarGroup >
                    <SidebarGroupLabel>Tools</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {
                                toolsMenu.map((item, index) => (
                                    <SidebarMenuItem key={index}>
                                        <SidebarMenuButton isActive={index == 0} asChild>
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
        </Sidebar>
    )
}

export default AppSidebar