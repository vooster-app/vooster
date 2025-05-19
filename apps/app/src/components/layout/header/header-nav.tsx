"use client";

import { SidebarTrigger } from "@vooster/ui/sidebar";

export default function HeaderNav() {
	return (
		<div className="w-full flex justify-between items-center border-b py-1.5 px-6 h-10">
			<SidebarTrigger className="" />
		</div>
	);
}
