
'use client';

import type { Panchang } from "@/lib/panchang";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sunrise, Sunset, Moon, AlertTriangle } from "lucide-react";

// Helper function to convert HH:MM time string to a percentage of the day
const timeToPercentage = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    return (totalMinutes / (24 * 60)) * 100;
};

// Helper function to convert time range to percentage and width
const timeRangeToStyle = (range: string) => {
    const [start, end] = range.split(' - ').map(t => t.replace(' AM', '').replace(' PM', ''));
    
    let [startH, startM] = start.split(':').map(Number);
    if (range.includes('PM') && startH < 12) startH += 12;

    let [endH, endM] = end.split(':').map(Number);
    if (range.includes('PM') && endH < 12) endH += 12;

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    const left = (startMinutes / (24 * 60)) * 100;
    const width = ((endMinutes - startMinutes) / (24 * 60)) * 100;
    
    return { left: `${left}%`, width: `${width}%` };
}

export function PanchangTimeline({ panchang }: { panchang: Panchang }) {

    const events = [
        { time: panchang.sunrise.replace(' AM',''), icon: Sunrise, color: 'text-orange-400', label: 'Sunrise' },
        { time: panchang.sunset.replace(' PM',''), icon: Sunset, color: 'text-indigo-400', label: 'Sunset' },
        { time: panchang.moonrise.replace(' PM',''), icon: Moon, color: 'text-gray-400', label: 'Moonrise' },
    ];

    const inauspiciousPeriods = [
        { label: 'Rahu Kalam', range: panchang.rahukalam, color: 'bg-red-500/30 border-red-500/50' },
        { label: 'Yama Gandam', range: panchang.yamaGandam, color: 'bg-orange-500/30 border-orange-500/50' },
    ];
    
    const getHourLabel = (hour: number) => {
        if (hour === 0) return '12AM';
        if (hour === 12) return '12PM';
        return hour > 12 ? `${hour - 12}PM` : `${hour}AM`;
    };

    return (
        <Card className="bg-transparent border-border">
            <CardHeader>
                <CardTitle>Today's Timeline</CardTitle>
            </CardHeader>
            <CardContent className="pt-8 px-8">
                <div className="relative h-4 bg-secondary rounded-full">
                    {/* Inauspicious Periods */}
                    {inauspiciousPeriods.map(period => {
                        const style = timeRangeToStyle(period.range);
                        return (
                             <div key={period.label}
                                className={`absolute h-4 top-0 rounded-full border-y-2 ${period.color}`}
                                style={{ left: style.left, width: style.width }}
                                title={`${period.label}: ${period.range}`}
                             ></div>
                        )
                    })}

                    {/* Time Events */}
                    {events.map((event, index) => {
                        let eventTime = event.time;
                        let [h, m] = eventTime.split(':').map(Number);
                        if(event.label.includes('Sunset') || (event.label.includes('Moonrise') && h < 12)) {
                            h += 12;
                        }
                        const leftPercentage = timeToPercentage(`${h}:${m}`);

                        return (
                            <div key={index} className="absolute top-1/2 -translate-y-1/2" style={{ left: `${leftPercentage}%` }}>
                               <div className="relative group">
                                     <event.icon className={`h-6 w-6 -translate-x-1/2 ${event.color}`} />
                                     <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-card p-2 rounded-md shadow-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <p className="font-bold">{event.label}</p>
                                        <p>{event.time} {event.label === 'Sunrise' ? 'AM' : 'PM'}</p>
                                    </div>
                               </div>
                            </div>
                        )
                    })}
                </div>
                 {/* Hour Markers */}
                 <div className="relative w-full flex justify-between mt-2 text-xs text-muted-foreground">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <span>|</span>
                            <span>{getHourLabel(i * 3)}</span>
                        </div>
                    ))}
                 </div>
            </CardContent>
        </Card>
    )
}
