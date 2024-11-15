import Image from "next/image";

export default function Footer() {
  return (
    <div className="bottom-0 w-full bg-background-primary flex items-center flex-col justify-center px-4">
      <div className="flex flex-row gap-2 justify-center items-center mb-2">
        <p className="inline-block text-white">Made with</p>
        ❤️
        <p className="inline-block text-white">@ ETH Global Bangkok</p>
      </div>
    </div>
  );
}
