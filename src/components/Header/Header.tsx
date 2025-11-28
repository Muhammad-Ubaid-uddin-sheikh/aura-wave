import Image from "next/image";
import { siteConfig } from "@/constants/siteConfig";
import Link from "next/link";
import { MenuIcon } from "lucide-react";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import LinkButton from "@/components/Header/LinkButton";
import { cookies } from "next/headers";
import MobileLogoutButton from "./User/MobileLogoutButton";
import BuyNow from "../HomePage/BuyNow";
import { ProductData } from "@/types";

const Header = ({ product }: { product: ProductData }) => {
  const token = cookies().get("token")?.value;

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Specs", href: "/#specs" },
    { label: "Reviews", href: "/#reviews" },
    { label: "FAQs", href: "/#faqs" },
    { label: "Contact Us", href: "/#contact" },
  ];

  return (
    // 
    <header className="w-full sticky top-0 z-50 bg-background shadow-md">
      {/* Top Banner */}
      <section className="text-center text-[13px] xs:text-base font-medium py-2 px-4 bg-primary text-primary-foreground">
        <p>Free Delivery All over Pakistan</p>
      </section>

      {/* Main Navigation Bar */}
      <nav>
        {/* Desktop Navbar */}
        <div className="max-w-[1400px] hidden md:flex justify-between items-center mx-auto py-1 px-6 lg:px-24 border-b border-border">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Main navigation"
            className="max-w-[1640px] mx-auto flex justify-center py-3 space-x-4"
          >
            <ul className="hidden md:flex justify-center py-3 space-x-4">
              {navLinks.map((link) => (
                <li key={link.href} className="list-none">
                  <LinkButton href={link.href} label={link.label} />
                </li>
              ))}
            </ul>
          </nav>

          {/* Buy Now */}
          <BuyNow headerRender={true} product={product}/>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-between py-1 px-3 border-border border-b">
          {/* Mobile Menu */}
          <Sheet>
            {/* Menu Icon */}
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="active:scale-90 p-1 cursor-pointer hover:text-primary-hover transition duration-300 hover:-translate-y-[2px] w-[80px]"
              >
                <MenuIcon size={25} />
              </button>
            </SheetTrigger>

            <SheetContent
              side={"left"}
              className="w-[75%] max-w-sm bg-background text-foreground"
            >
              <DialogTitle className="sr-only">Mobile Navigation</DialogTitle> {/* For Screen reader, visually hidden */}
              <DialogDescription className="sr-only">
                Navigate through mobile menu
              </DialogDescription>

              <aside className="h-full flex flex-col justify-between">
                {/* Mobile Logo in Sheet*/}
                <div className="mt-2">
                  <Logo />
                </div>

                {/* Mobile NavLinks */}
                <nav aria-label="Main navigation" className="overflow-y-auto flex-1 mt-7 ml-2 ">
                  <ul className="space-y-6 text-lg font-medium">
                    {navLinks.map((link) => (
                      <li key={link.label} className="list-none">
                        <LinkButton href={link.href} label={link.label} />
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* Social Links and Auth Button */}
                <div className="space-y-4 mb-4">
                  {/* User Icon */}
                  {token ? <MobileLogoutButton /> : (
                    <Link href={"/auth"} aria-label="Log in">
                      <Button
                        variant="outline"
                        className="flex items-center rounded-full w-full text-md hover:bg-accent hover:text-accent-foreground transition-colors mt-2"
                      >
                        Log in
                      </Button>
                    </Link>
                  )}

                  {/* Social Links */}
                  <div className="flex justify-center space-x-4 mt-4 text-foreground [&>a:hover]:text-primary transition-colors duration-300">
                    <Link
                      href={siteConfig.socials.facebook}
                      aria-label="Facebook"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <FaFacebook size={20} />
                    </Link>
                    <Link
                      href={siteConfig.socials.instagram}
                      aria-label="Instagram"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <FaInstagram size={20} />
                    </Link>
                    <Link
                      href={siteConfig.socials.tiktok}
                      aria-label="TikTok"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <FaTiktok size={20} />
                    </Link>
                  </div>
                </div>
              </aside>
            </SheetContent>
          </Sheet>

          {/* Mobile Logo */}
          <Logo />

          {/* Buy Now */}
          <BuyNow headerRender={true} product={product}/>
        </div>
      </nav>
    </header>
  );
};

export default Header;

function Logo() {
  return (
    
    <div>
      <Link href={"/"} aria-label="Home">
        <Image
          src={siteConfig.logo}
          alt={siteConfig.name}
          width={80}
          height={80}
          className="object-contain transition-all duration-300 hover:-translate-y-1 sm:w-[100px] md:w-[130px]"
        />
      </Link>
    </div>
  )
}