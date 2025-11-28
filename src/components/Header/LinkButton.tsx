import Link from "next/link"

interface LinkButtonProps {
  href: string
  label: string
}

const LinkButton = ({ href, label }: LinkButtonProps) => {
  return (
    <Link href={href} className="group inline-block relative">
      <span>{label}</span>
      <div className="absolute -bottom-[1px] left-0 h-0.5 bg-primary w-0 group-hover:w-full transition-all duration-300" />
    </Link>
  )
}

export default LinkButton