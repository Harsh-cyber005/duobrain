import { BrainIcon } from '@/app/_icons/BrainIcon';
import React from 'react';
import SidebarItem from './SidebarItem';
import { TweeterIcon } from '@/app/_icons/Tweeter';
import { YoutubeIcon } from '@/app/_icons/Youtube';
import { DocumentIcon } from '@/app/_icons/DocumentIcon';
import { LinkIcon } from '@/app/_icons/LinkIcon';
import { useAppContext } from '@/app/context/AppContext';
import { FilterIcon } from '@/app/_icons/FilterIcon';
import { LogoutIcon } from '@/app/_icons/LogoutIcon';
import { InstagramIcon } from '@/app/_icons/Instagram';
import { PinterestIcon } from '@/app/_icons/Pinterest';
import { CrossIcon } from '@/app/_icons/CrossIcon';
import { useRouter } from 'next/navigation';

function Sidebar() {
    const { setFilter, filter, setAuthName, authName, sidebarOpen, setSidebarOpen } = useAppContext();
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);
    const router = useRouter();

    React.useEffect(() => {
        router.prefetch('/dashboard');
        router.prefetch('/filter/tweet');
        router.prefetch('/filter/youtube');
        router.prefetch('/filter/instagram');
        router.prefetch('/filter/pinterest');
        router.prefetch('/filter/document');
        router.prefetch('/filter/link');
    }, [router]);

    const handleFilter = (filter: string) => {
        setSidebarOpen(false);
        router.push(filter ? `/filter/${filter}` : '/dashboard', undefined);
        setFilter(filter);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('authName');
        localStorage.removeItem('cachedData');
        setAuthName('');
        setSidebarOpen(false);
        window.location.reload();
    };

    const sidebarItems = [
        { key: '', title: 'All', icon: <FilterIcon size='md' /> },
        { key: 'tweet', title: 'Tweets', icon: <TweeterIcon size='md' /> },
        { key: 'youtube', title: 'Videos', icon: <YoutubeIcon size='md' /> },
        { key: 'instagram', title: 'Instagram posts', icon: <InstagramIcon size='md' /> },
        { key: 'pinterest', title: 'Pinterest', icon: <PinterestIcon size='md' /> },
        { key: 'document', title: 'Documents', icon: <DocumentIcon size='md' /> },
        { key: 'link', title: 'Links', icon: <LinkIcon size='md' /> },
    ];

    return (
        <div
            className={`lg:w-[300px] xs:w-max w-full py-7 px-5 h-screen fixed bg-white shadow-lg left-0 top-0 z-50 transition-transform duration-300 ease-in-out 
            ${sidebarOpen ? 'translate-x-0' : 'translate-x-[-100%] xs:translate-x-0'}`}
        >
            <div className='flex xs:justify-start justify-between items-center gap-3 px-3 cursor-pointer'>
                <BrainIcon className='size-8 hidden xs:flex' />
                <h1 className='text-xl font-bold lg:flex hidden'>duobrain</h1>
                <h1
                    onClick={() => router.replace('/dashboard')}
                    className='text-xl font-bold xs:hidden flex text-[#5046E4]'
                >
                    {authName}
                </h1>
                <div
                    onClick={() => setSidebarOpen(false)}
                    className='hover:bg-gray-200 duration-200 p-2 rounded-md cursor-pointer xs:hidden'
                >
                    <CrossIcon size='md' />
                </div>
            </div>

            {/* Large Screen Sidebar */}
            <div className='lg:flex xs:hidden flex flex-col justify-between'>
                <div className='mt-5 flex flex-col'>
                    {sidebarItems.map(({ key, title, icon }) => (
                        <SidebarItem
                            key={key}
                            onClick={() => handleFilter(key)}
                            title={title}
                            icon={icon}
                            active={filter === key}
                        />
                    ))}
                </div>
                {authName && (
                    <SidebarItem
                        onClick={handleLogout}
                        onMouseDown={() => setIsLoggingOut(true)}
                        onMouseUp={() => setIsLoggingOut(false)}
                        title='Logout'
                        icon={<LogoutIcon size='md' />}
                        active={isLoggingOut}
                    />
                )}
            </div>

            {/* Small Screen Sidebar */}
            <div className='xs:flex hidden flex-col justify-between lg:hidden'>
                <div className='mt-5 flex flex-col'>
                    {sidebarItems.map(({ key, icon }) => (
                        <SidebarItem
                            key={key}
                            onClick={() => handleFilter(key)}
                            icon={icon}
                            active={filter === key}
                        />
                    ))}
                </div>
                {authName && (
                    <SidebarItem
                        onClick={handleLogout}
                        onMouseDown={() => setIsLoggingOut(true)}
                        onMouseUp={() => setIsLoggingOut(false)}
                        icon={<LogoutIcon size='md' />}
                        active={isLoggingOut}
                    />
                )}
            </div>
        </div>
    );
}

export default Sidebar;
