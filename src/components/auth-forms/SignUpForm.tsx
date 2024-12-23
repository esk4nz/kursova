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
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { RegisterFormSchema } from "@/schemas/formSchemas";
import { createUser } from "@/app/api/user/user";

const SignUpForm = () => {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof RegisterFormSchema>>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      passwordRepeat: "",
      phoneNumber: "",
    },
  });
  async function onSubmit(values: z.infer<typeof RegisterFormSchema>) {
    console.log(values);
    try {
      await createUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        phoneNumber: values.phoneNumber,
      });

      toast({
        title: "Ура!",
        description: "Користувач успішно створений! Увійдіть у свій акаунт.",
      });
      router.push("/sign-in");
    } catch (error) {
      console.error("Помилка запиту:", error);
      toast({
        title: "Помилка",
        description:
          error instanceof Error
            ? error.message
            : "Щось пішло не так. Спробуйте ще раз!",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Ім'я <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Введіть ім'я" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Прізвище <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Введіть прізвище" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="phoneNumber"
            control={form.control}
            rules={{ required: "Номер телефону обов'язковий" }}
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>
                  Номер телефону <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <PhoneInput
                    country={"ua"}
                    onlyCountries={["ua"]}
                    disableDropdown={true}
                    placeholder="Введіть номер телефону"
                    value={field.value}
                    onChange={(value) => {
                      field.onChange(value);
                      console.log(value);
                    }}
                    inputStyle={{ width: "100%" }}
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message || " "}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Електронна пошта <span className="text-red-500">*</span>
                </FormLabel>
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
                <FormLabel>
                  Пароль <span className="text-red-500">*</span>
                </FormLabel>
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
          <FormField
            control={form.control}
            name="passwordRepeat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Підтвердження паролю <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Повторіть пароль"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button className="w-full mt-9 rounded-full" type="submit">
          Зареєструватись
        </Button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6 mb-2">
        Якщо у Вас вже є аккаунту, можете &nbsp;
        <Link className="text-blue-500 hover:underline" href="/sign-in">
          увійти
        </Link>
      </p>
    </Form>
  );
};

export default SignUpForm;
