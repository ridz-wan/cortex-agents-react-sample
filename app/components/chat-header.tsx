'use client';

import Image from 'next/image';
import { Button } from './ui/button';
import { PlusIcon } from './icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export function ChatHeader() {

    return (
        <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
            <div className="flex items-center gap-2">
                <Image
                    src="/shippit.png"
                    alt="Shippit"
                    width={120}
                    height={40}
                    className="h-8 w-auto"
                    priority
                />
            </div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
                            onClick={() => {
                                window.location.reload();
                            }}
                        >
                            <PlusIcon />
                            <span>New Chat</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>New Chat</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </header>
    );
}