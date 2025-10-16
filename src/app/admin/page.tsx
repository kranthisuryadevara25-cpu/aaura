
'use client';

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, FileCheck, DollarSign, UserPlus, Loader2, ListPlus } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { collection, query, where } from "firebase/firestore";
import { useFirestore } from "@/lib/firebase/provider";
import { useMemo } from "react";
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns';
import Link from "next/link";
import { Button } from "@/components/ui/button";

const chartData = [
  { month: "January", users: 186 },
  { month: "February", users: 305 },
  { month: "March", users: 237 },
  { month: "April", users: 73 },
  { month: "May", users: 209 },
  { month: "June", users: 214 },
]

const chartConfig = {
  users: {
    label: "New Users",
    color: "hsl(var(--primary))",
  },
}

export default function AdminDashboardPage() {
  const db = useFirestore();
  const [users, usersLoading] = useCollectionData(collection(db, 'users'));
  const [pendingMedia, pendingLoading] = useCollectionData(query(collection(db, 'media'), where('status', '==', 'pending')));
  
  const totalUsers = users?.length || 0;
  const pendingCount = pendingMedia?.length || 0;

  const newUsersThisMonth = useMemo(() => {
    if (!users) return 0;
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    return users.filter(user => {
        const creationDate = user.creationTimestamp?.toDate();
        return creationDate && creationDate >= start && creationDate <= end;
    }).length;
  }, [users]);

  // Mock total sales
  const totalSales = 45231.89;

  return (
    <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        <div className="text-left mb-8">
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tight text-primary">
              Admin Dashboard
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              An overview of your application's activity and health.
          </p>
      </div>

       <div className="flex justify-end mb-4">
        <Button asChild>
            <Link href="/admin/stubs">
                <ListPlus className="mr-2 h-4 w-4" />
                Content Planning
            </Link>
        </Button>
    </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {usersLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{totalUsers}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Pending</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {pendingLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">{pendingCount}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSales.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users (This Month)</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {usersLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <div className="text-2xl font-bold">+{newUsersThisMonth}</div>}
          </CardContent>
        </Card>
      </div>

       <Card className="mt-8">
        <CardHeader>
          <CardTitle>New Users Over Time</CardTitle>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                 <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  dataKey="users"
                  type="natural"
                  fill="var(--color-users)"
                  fillOpacity={0.4}
                  stroke="var(--color-users)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </CardHeader>
      </Card>

    </main>
  );
}
