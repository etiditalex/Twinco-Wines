import Image from "next/image";

const checks = ["Affordable", "Convenient", "Fast & free delivery"];

export function HeroBanner() {
  return (
    <div className="my-3">
      <div className="relative flex h-[560px] items-center justify-around overflow-hidden border-4 border-white bg-gradient-to-br from-[#1a62f0] via-[#0d41be] to-[#003090] p-px sm:h-[400px] sm:border-x-0 sm:border-t-0 sm:border-b-4 sm:border-black sm:p-0">
        <Image
          src="/brand/hero-graham-tight.png"
          alt=""
          width={237}
          height={768}
          priority
          className="pointer-events-none absolute bottom-[-18%] left-[22%] z-0 h-[62%] w-auto object-contain sm:bottom-[-34%] sm:left-[9%] sm:h-[130%]"
        />
        <Image
          src="/brand/hero-nederburg-tight.png"
          alt=""
          width={190}
          height={769}
          priority
          className="pointer-events-none absolute bottom-[-8%] left-[-2%] z-10 h-[58%] w-auto -rotate-6 object-contain sm:bottom-[-22%] sm:left-[0%] sm:h-[118%] sm:-rotate-[6deg]"
        />
        <Image
          src="/brand/hero-hand-glass.png"
          alt=""
          width={538}
          height={471}
          priority
          className="pointer-events-none absolute top-0 right-[-22%] z-0 h-[34%] w-auto rotate-[8deg] object-contain sm:top-auto sm:right-0 sm:bottom-[-8%] sm:h-[58%] sm:rotate-0"
        />

        <div className="relative z-20 flex max-w-sm flex-col rounded-lg bg-white/70 p-2 text-[#212121] sm:max-w-none sm:bg-transparent sm:text-white">
          <h1 className="mb-8 text-2xl font-semibold text-[#212121] sm:mb-2 sm:text-white">Nyali&apos;s online wine store</h1>
          {checks.map((item) => (
            <span key={item} className="flex flex-row items-center py-1">
              <CheckIcon />
              <span className="ml-2">{item}</span>
            </span>
          ))}
          <p className="mt-6 text-base sm:mt-5">
            Wine shopping made <span className="font-bold text-red-500 sm:text-white">Fast</span>,{" "}
            <span className="font-bold text-red-500 sm:text-white">Easy</span>, and{" "}
            <span className="font-bold text-red-500 sm:text-white">Fun</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 16 16" fill="#4CAF50" aria-hidden="true" className="shrink-0">
      <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0z" />
      <path d="m5.354 7.146.896.897-.707.707-.897-.896a.5.5 0 1 1 .708-.708z" />
    </svg>
  );
}
