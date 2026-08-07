export default function Content() {
  return (
    <section id="how-it-works" className="bg-background @container py-24 border-t">
      <div className="@2xl:grid-cols-2 mx-auto grid max-w-3xl gap-6 px-6">
        <div>
          <h2 className="text-balance font-serif text-4xl font-medium">
            From Search to Doorstep in Minutes
          </h2>
          <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
            No complicated forms. No payment gateways. Just pick, request, and connect.
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
              Choose your city, pinpoint your neighborhood, and pick the trade you need — electrician, plumber, AC tech, or more.
            </p>
          </div>

          <div className="flex gap-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              2
            </span>
            <p className="text-muted-foreground text-sm">
              <span className="text-foreground font-medium block text-base mb-1">
                Pick a Verified, Available Worker
              </span>
              Browse profiles of workers who are online right now, CNIC-verified, and serving your area.
            </p>
          </div>

          <div className="flex gap-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              3
            </span>
            <p className="text-muted-foreground text-sm">
              <span className="text-foreground font-medium block text-base mb-1">
                Request, Accept, Connect
              </span>
              Describe what needs fixing and set your budget. Once the worker accepts, you get their direct WhatsApp and phone number.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
