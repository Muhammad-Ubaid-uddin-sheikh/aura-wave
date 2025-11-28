import { Input } from "../ui/input";
import { Label } from "../ui/label";

export const FormField = ({ id, label, register, type = "text", placeholder, error }: any) => (
  <div>
    <Label htmlFor={id}>{label}</Label>
    <Input id={id} {...register(id)} type={type} placeholder={placeholder} className='rounded-[6px] py-5 w-full mt-1' />
    {error && <p className='text-red-500 text-sm mt-1'>{error.message}</p>}
  </div>
);