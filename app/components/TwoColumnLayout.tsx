type TwoColumnLayoutProps = {
  left: React.ReactNode;
  right: React.ReactNode;
};

export function TwoColumnLayout({left, right}: TwoColumnLayoutProps) {
  return (
    <div className="px-10 border-y-2 border-neutral-300">
      <div className="relative grid grid-cols-2 border-x-2 border-neutral-300">
        <div className="w-full aspect-square border-r-2 border-neutral-300 overflow-scroll">
          {left}
        </div>
        <div className="w-full aspect-square overflow-scroll">{right}</div>

        {/* dots */}
        <div className="absolute size-2 top-0 left-0 transform -translate-x-3/5 -translate-y-3/5 bg-white border-2 border-neutral-300 rounded-full"></div>
        <div className="absolute size-2 top-0 right-0 transform translate-x-3/5 -translate-y-3/5 bg-white border-2 border-neutral-300 rounded-full"></div>
        <div className="absolute size-2 bottom-0 left-0 transform -translate-x-3/5 translate-y-3/5 bg-white border-2 border-neutral-300 rounded-full"></div>
        <div className="absolute size-2 bottom-0 right-0 transform translate-x-3/5 translate-y-3/5 bg-white border-2 border-neutral-300 rounded-full"></div>
        <div className="absolute size-2 top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-neutral-300 rounded-full"></div>
        <div className="absolute size-2 bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-white border-2 border-neutral-300 rounded-full"></div>
      </div>
    </div>
  );
}
