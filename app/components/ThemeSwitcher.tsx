export function ThemeSwitcher() {
  return (
    <div className="relative z-10">
      <div className="absolute size-2 top-1/2 left-0 transform -translate-x-2/5 -translate-y-1/2 bg-black border sm:border-2 border-neutral-300 rounded-full"></div>
      <div className="size-9 bg-black border sm:border-2 border-neutral-300 rounded-full"></div>
      <div className="absolute size-2 top-1/2 right-0 transform translate-x-2/5 -translate-y-1/2 bg-black border sm:border-2 border-neutral-300 rounded-full"></div>
    </div>
  );
}
