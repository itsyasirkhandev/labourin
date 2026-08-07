export default function Content() {
  return (
    <section id="how-it-works" className="bg-background @container py-24 border-t">
      <div className="@2xl:grid-cols-2 mx-auto grid max-w-3xl gap-6 px-6">
        <div>
          <h2 className="text-balance font-serif text-4xl font-medium">
            Get Help at Home in 3 Simple Steps
          </h2>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
            No complex signups or payment forms. Find verified local experts in minutes whenever emergency repairs strike.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex gap-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              1
            </span>
            <p className="text-muted-foreground text-sm">
              <span className="text-foreground font-medium block text-base mb-1">
                Select City, Area & Category
              </span>
              Pick your location (Lahore, Karachi, or Islamabad), neighborhood area, and the skilled trade you need.
            </p>
          </div>

          <div className="flex gap-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              2
            </span>
            <p className="text-muted-foreground text-sm">
              <span className="text-foreground font-medium block text-base mb-1">
                Choose an Available & Verified Provider
              </span>
              Browse profiles of workers currently online, active, and verified with valid CNIC credentials.
            </p>
          </div>

          <div className="flex gap-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              3
            </span>
            <p className="text-muted-foreground text-sm">
              <span className="text-foreground font-medium block text-base mb-1">
                Submit Request & Connect Directly
              </span>
              Describe the problem and set your estimated budget. Once accepted, open direct phone or WhatsApp contact to complete the job offline.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
