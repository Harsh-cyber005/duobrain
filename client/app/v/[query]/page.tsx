"use client";
import SearchPage from '@/app/_components/ui/SearchPage';
import Sidebar from '@/app/_components/ui/Sidebar'
import React, { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function SearchTopPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		if (!localStorage.getItem('token')) {
			router.replace('/auth/login');
		} else {
			setLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	return (
		loading ?
			<main>
				<div className="flex items-center justify-center h-screen">
					<Loader2 className="animate-spin stroke-2 size-6" />
				</div>
			</main> :
			<main className="flex">
				<Sidebar />
				<SearchPage />
				<Toaster position="top-right" />
			</main>
	)
}

export default SearchTopPage