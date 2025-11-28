"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail } from "lucide-react"
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa"
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form"
import { toast } from "sonner";
import { useState } from "react";
import { ContactFormValues, contactSchema } from "@/schemas/contact";
import { zodResolver } from "@hookform/resolvers/zod"
import { siteConfig } from "@/constants/siteConfig";

const Contact = () => {
  const [isLoading, setIsLoading] = useState(false); // Loading State

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormValues) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/submit-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (result.success) {
        toast.success("Message sent successfully!", { duration: 3000 })
        reset()
        setIsLoading(false);
      } else {
        toast.error("Failed to send message.", { duration: 3000 })
      }
    } catch (error) {
      console.error("Submit error:", error)
      toast.error("Something went wrong.", { duration: 3000 })
    }
  }
  return (
    <div id="contact" aria-label="Contact" className="scroll-mt-24 max-w-[1300px] mx-auto py-16 px-4">

      {/* Heading */}
      <div className="text-center space-y-4 mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold font-poppinsBold text-primary tracking-wider relative inline-block">
          Contact Us
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-[2px] bg-accent-foreground rounded-full" />
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
          Drop us a message — our team is here to help with any product or support questions.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-start justify-center gap-5 px-4 max-w-3xl mx-auto">
        {/* Contact Details Section */}
        <div className="max-w-[250px] w-full space-y-6">
          <div className="flex items-center gap-3 sm:gap-6">
            <span><MapPin /></span>
            <div>
              <h3 className="text-primary text-2xl font-semibold">Address</h3>
              <p>
                {siteConfig.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <span><Phone /></span>
            <div>
              <h3 className="text-primary text-2xl font-semibold">Phone</h3>
              <span className="hover:text-muted-foreground transition cursor-pointer">
                {siteConfig.phone}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <span><Mail /></span>
            <div>
              <h3 className="text-primary text-2xl font-semibold">Email</h3>
              <span className="hover:text-muted-foreground transition cursor-pointer">
                {siteConfig.email}
              </span>
            </div>
          </div>

          {/* Social Icons */}
          <div className="pt-4 flex gap-4">
            <span className=" hover:text-blue-600 cursor-pointer">
              <FaFacebookF size={20} />
            </span>
            <span className=" hover:text-pink-500 cursor-pointer" >
              <FaInstagram size={20} />
            </span>
            <span className=" hover:text-black cursor-pointer">
              <FaTiktok size={20} />
            </span>
          </div>
        </div>

        {/* Contact Form Section */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="max-w-4xl w-full flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Your name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your Name"
                className="rounded-[10px] py-6 w-full mt-2"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="number">Number</Label>
              <Input
                id="number"
                type="text"
                placeholder="Enter your number"
                className="rounded-[10px] py-6 w-full mt-2"
                {...register("number", { required: "Number is required" })}
              />
              {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="rounded-[10px] py-6 w-full mt-2"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email",
                },
              })}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Hi! I’d like to ask about"
              className="rounded-[10px] py-3 px-4 resize-none mt-2"
              rows={4}
              {...register("message", { required: "Message is required" })}
            />
            {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
          </div>

          <Button
            type="submit"
            variant="outline"
            className="rounded-[10px] text-xl py-7 hover:bg-primary hover:text-primary-foreground border-primary duration-500 transition-colors w-[237px] mt-5 mx-auto md:mx-0"
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Contact;