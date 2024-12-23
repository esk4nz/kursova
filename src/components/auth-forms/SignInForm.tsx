"use client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const FormSchema = z.object({
  email: z
    .string()
    .min(1, "Електронна пошта обов'язкова")
    .email("Неправильно електронна пошта"),
  password: z.string().min(1, "Пароль обов'язковий"),
});

const SignInForm = () => {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    const data = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    });

    if (data?.error) {
      toast({
        title: "Помилка",
        description: "Обана... Неправильний логін або пароль!",
      });
      console.log("Помилка");
    } else {
      router.push("/user-profile");
      router.refresh();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Електронна пошта</FormLabel>
                <FormControl>
                  <Input placeholder="Введіть пошту" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Пароль</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Введіть пароль"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button className="w-full mt-9 rounded-full" type="submit">
          Увійти
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6 mb-2">
        Якщо у Вас немає аккаунту, можете &nbsp;
        <Link className="text-blue-500 hover:underline" href="/sign-up">
          зареєструватись
        </Link>
      </p>
    </Form>
  );
};

export default SignInForm;
