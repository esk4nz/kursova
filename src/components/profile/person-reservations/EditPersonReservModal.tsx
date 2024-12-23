import { useEffect } from "react";
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
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const reservationEditSchema = z.object({
  id: z.number(),
  customer_name: z
    .string()
    .min(2, "Ім'я обов'язкове")
    .regex(/^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ']+$/, "Ім'я може містити тільки літери"),
  customer_surname: z
    .string()
    .min(1, "Прізвище обов'язкове")
    .regex(
      /^[a-zA-Zа-яА-ЯёЁіІїЇєЄґҐ']+$/,
      "Прізвище може містити тільки літери"
    ),
  customer_phone: z
    .string()
    .regex(/^380\d{9}$/, "Номер телефону має бути у форматі +380XXXXXXXXX"),
});

type ReservationEditFormValues = z.infer<typeof reservationEditSchema>;

type EditModalProps = {
  isOpen: boolean;
  data: ReservationEditFormValues | null;
  onClose: () => void;
  onSave: (updatedData: ReservationEditFormValues) => Promise<void>;
};

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  data,
  onClose,
  onSave,
}) => {
  const form = useForm<ReservationEditFormValues>({
    resolver: zodResolver(reservationEditSchema),
    defaultValues: {
      customer_name: "",
      customer_surname: "",
      customer_phone: "",
    },
  });

  // Виклик reset тільки при зміні `data`
  useEffect(() => {
    if (data) {
      form.reset(data);
    }
  }, [data]); // Залежність лише від `data`

  const handleSubmit = async (values: ReservationEditFormValues) => {
    console.log("Submitting values:", values);
    await onSave(values);
    onClose();
  };

  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Редагувати резервацію</h2>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="customer_name"
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
              name="customer_surname"
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
              control={form.control}
              name="customer_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Телефон <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <PhoneInput
                      country={"ua"}
                      onlyCountries={["ua"]}
                      disableDropdown={true}
                      placeholder="Введіть номер телефону"
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      inputStyle={{ width: "100%" }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-4 mt-6">
              <Button onClick={onClose} variant="cancel" type="button">
                Скасувати
              </Button>
              <Button type="submit" variant="submit">
                Зберегти
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  ) : null;
};

export default EditModal;
