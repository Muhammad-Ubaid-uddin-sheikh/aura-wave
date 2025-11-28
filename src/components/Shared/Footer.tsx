import Link from "next/link";
import {
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import Image from "next/image";
import { siteConfig } from "@/constants/siteConfig";

const Footer = () => {
  const linkSections = [
    {
      title: "Main Menu",
      links: [
        { label: "Home", href: "/" },
        { label: "Specs", href: "/#specs" },
        { label: "Reviews", href: "/#reviews" },
        { label: "FAQs", href: "/#faqs" },
        { label: "Contact Us", href: "/#contact" },
      ],
    },
    {
      title: "Quick Links",
      links: [
        { label: "Privacy Policy", href: "/" },
        { label: "Shipping Policy", href: "/" },
        { label: "Terms & Conditions", href: "/" },
        { label: "Complaints & Feedback", href: "/" },
      ],
    },
    {
      title: "Shop Information",
      links: [
        {
          icon: <FaMapMarkerAlt className="text-lg min-w-[20px]" />,
          type: "text",
          value: siteConfig.address,
        },
        {
          icon: <FaPhoneAlt className="text-lg min-w-[20px]" />,
          type: "tel",
          value: siteConfig.phone,
        },
        {
          icon: <FaEnvelope className="text-lg min-w-[20px]" />,
          type: "email",
          value: siteConfig.email,
        },
      ],
    },
  ];

  return (
    <footer className="bg-secondary-foreground text-secondary-foreground text-sm md:text-base">
      {/* Footer Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-16 lg:px-24 py-10 border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Logo & Description */}
          <div className="max-w-md ">
            <Link href="/" aria-label="Home">
              <Image
                src={siteConfig.logo}
                alt={siteConfig.name}
                width={100}
                height={80}
                className="mb-4 object-contain"
              />
            </Link>
            <p className="text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>

          {/* Navigation + Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
           
            {linkSections.map((section, index) => (
              <div key={index}>
                <h3 className="text-primary font-semibold mb-4 ">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.links.map((link, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-muted-foreground"
                    >
                      {"icon" in link ? (
                        <div className="flex items-center gap-2">
                          {link.icon}
                          {link.type === "tel" ? (
                            <a
                              href="/"
                              className="hover:text-primary transition"
                            >
                              {link.value}
                            </a>
                          ) : link.type === "email" ? (
                            <a
                              href="/"
                              className="hover:text-primary transition"
                            >
                              {link.value}
                            </a>
                          ) : (
                            <span>{link.value}</span>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={link.href}
                          className="flex items-center gap-2 hover:text-primary transition-all duration-300 hover:translate-x-[6px]"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

           
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="max-w-[1640px] mx-auto px-6 md:px-16 lg:px-24 xl:px-32 flex flex-col-reverse md:flex-row justify-between items-center py-5">
        <p className="text-muted-foreground text-center md:text-left mt-4 md:mt-0">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>

        <div className="flex space-x-4 text-foreground hover:[&>a]:text-primary transition-colors duration-300">
          <span>
            <FaFacebook size={20} />
          </span>
          <span>
            <FaInstagram size={20} />
          </span>
          <span>
            <FaTiktok size={20} />
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;