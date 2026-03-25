import Link from "next/link";
import Image from "next/image";

export default function HomeButton() {
  return (
    <Link
      href="/"
      className="fixed top-5 left-5 z-50 opacity-80 hover:opacity-100 transition-opacity duration-300"
      aria-label="Return to King's Chamber entrance"
    >
      <Image
        src="/logo.png"
        alt="King's Chamber"
        width={44}
        height={44}
        className="rounded-full"
        priority
      />
    </Link>
  );
}
