import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export interface TicketData {
  company: string;
  ticketCode: string;
  counterName: string;
  timestamp: Date;
}

export function generateTicketESCPOS(data: TicketData): string[] {
  const time = data.timestamp.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Manila'   
  });
  
  const date = data.timestamp.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Manila' 
  });

  return [
    "\x1B\x40",
    "\x1B\x61\x01",
    "\x1B\x45\x01",
    "\x1B\x21\x30",
    `${data.ticketCode}\n`,
    "\x1B\x21\x00",
    "\n",
    `Counter: ${data.counterName}\n`,
    `Date: ${date} ${time}\n`,
    "This ticket is valid for\n",
    "one transaction only.\n",
    "\n",
    "Thank you!\n",
    "\x1D\x56\x41\x10"
  ];
}