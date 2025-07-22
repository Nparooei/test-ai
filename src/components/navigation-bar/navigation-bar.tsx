import Image from "next/image";
import AhLogo from "@/assets/ah-logo.svg"

export default function NavigationBar() {
    return <header className="row-start-1 w-full flex justify-between items-center border-b pb-4">
        <div className="flex items-center gap-3">
            <Image src={AhLogo} alt="AH Logo" width={32} height={32} />
            <span className="font-semibold text-lg">Albert Hijn Agent 0.1</span>
        </div>
        <nav className="hidden sm:flex gap-6 text-sm font-medium">
            <a href="#" className="hover:underline">Home</a>
            <a href="#" className="hover:underline">About</a>
        </nav>
    </header>
}