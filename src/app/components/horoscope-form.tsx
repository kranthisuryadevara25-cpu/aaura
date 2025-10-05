"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { zodiacSigns } from "@/lib/zodiac";
import { getHoroscope, type HoroscopeState } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  birthDate: z.date({
    required_error: "A date of birth is required.",
  }),
  zodiacSign: z.enum(zodiacSigns, {
    required_error: "Please select a zodiac sign.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export function HoroscopeForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<HoroscopeState | null>(null);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    setResult(null);
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("birthDate", data.birthDate.toISOString());
    formData.append("zodiacSign", data.zodiacSign);

    startTransition(async () => {
      const res = await getHoroscope(formData);
      setResult(res);
      if (!res.success && res.message) {
        toast({
          variant: "destructive",
          title: "An error occurred",
          description: res.message,
        });
      }
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Discover Your Cosmic Path</CardTitle>
          <CardDescription>Enter your details to receive a personalized horoscope.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Jane Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of birth</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zodiacSign"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zodiac Sign</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your sign" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {zodiacSigns.map((sign) => (
                            <SelectItem key={sign} value={sign}>
                              {sign}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate Horoscope
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isPending && (
          <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary"/>
              <p className="ml-4 text-muted-foreground">The cosmos are aligning for you...</p>
          </div>
      )}

      {!isPending && result?.success && result.horoscope && (
        <Card className="bg-accent/10 border-accent/50 shadow-lg animate-in fade-in-50 zoom-in-95 duration-500">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2 text-accent-foreground">
              <Sparkles className="h-6 w-6 text-accent" />
              Your Personalized Horoscope
            </CardTitle>
            <CardDescription className="text-accent-foreground/80">
              For {form.getValues("name")}, a {form.getValues("zodiacSign")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground/90 leading-relaxed">{result.horoscope.horoscope}</p>
            <p className="text-xs text-muted-foreground italic">{result.horoscope.disclaimer}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
